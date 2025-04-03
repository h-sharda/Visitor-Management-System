#include "WiFi.h"
#include "esp_camera.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

// WiFi credentials
const char* ssid = "NSUT_WIFI";
const char* password = "";

// Server API endpoint information
const char* serverHost = "10.100.187.233";
const int serverPort = 3000;
const char* serverPath = "/entry/esp32-upload";
const char* authToken = ;

// Camera pins configuration for ESP32-CAM AI Thinker module
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // Disable brownout detector

  Serial.begin(115200);
  Serial.println("ESP32-CAM Vehicle Entry System");

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_RGB565;  // RGB565 format
  config.frame_size = FRAMESIZE_QVGA;      // 320x240 - smaller size to reduce memory usage
  config.jpeg_quality = 12;                // Not used for RGB565
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera initialization failed with error 0x%x\n", err);
    delay(1000);
    ESP.restart();
  }

  connectToWiFi();
}

void loop() {
  captureAndUploadImage();
  delay(30000); // Send image every 30 seconds
}

void connectToWiFi() {
  Serial.printf("Connecting to %s ", ssid);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(" Failed to connect to WiFi!");
    delay(3000);
    ESP.restart();
  } else {
    Serial.println(" Connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  }
}

void captureAndUploadImage() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  Serial.printf("Image captured, size: %u bytes\n", fb->len);

  WiFiClient client;
  
  if (!client.connect(serverHost, serverPort)) {
    Serial.println("Connection to server failed");
    esp_camera_fb_return(fb);
    return;
  }
  
  // Generate boundary
  String boundary = "ImageBoundary";
  
  // Create multipart form data
  String head = "--" + boundary + "\r\n";
  head += "Content-Disposition: form-data; name=\"image\"; filename=\"esp32cam.rgb565\"\r\n";
  head += "Content-Type: application/octet-stream\r\n\r\n";
  
  String tail = "\r\n--" + boundary + "--\r\n";
  
  uint32_t contentLength = head.length() + fb->len + tail.length();
  
  // Send HTTP POST request
  client.println("POST " + String(serverPath) + " HTTP/1.1");
  client.println("Host: " + String(serverHost));
  client.println("Authorization: " + String(authToken));
  client.println("Content-Length: " + String(contentLength));
  client.println("Content-Type: multipart/form-data; boundary=" + boundary);
  client.println("Connection: close");
  client.println();
  
  // Send multipart form data header
  client.print(head);
  
  // Send image data in chunks
  uint8_t *fbBuf = fb->buf;
  size_t fbLen = fb->len;
  
  const size_t bufferSize = 1024;
  size_t totalSent = 0;
  
  Serial.println("Sending image data...");
  
  // Send small chunks with delay to prevent buffer overflow
  while (totalSent < fbLen) {
    size_t remaining = fbLen - totalSent;
    size_t toSend = remaining > bufferSize ? bufferSize : remaining;
    
    size_t sent = client.write(fbBuf + totalSent, toSend);
    if (sent > 0) {
      totalSent += sent;
      
      // Show progress periodically
      if (totalSent % (fbLen / 10) < bufferSize) {
        Serial.printf("Progress: %d%%\n", (totalSent * 100) / fbLen);
      }
      
      // Small delay to avoid overwhelming the network stack
      delay(1);
    } else {
      Serial.println("Failed to send chunk");
      delay(100);
    }
  }
  
  // Send closing boundary
  client.print(tail);
  
  // Wait for server response
  Serial.println("Waiting for response");
  unsigned long timeout = millis();
  bool headerReceived = false;
  String responseBody = "";
  
  while (client.connected() && millis() - timeout < 10000) {
    if (client.available()) {
      String line = client.readStringUntil('\n');
      line.trim();
      
      if (!headerReceived && line.length() == 0) {
        headerReceived = true;
      } else if (headerReceived) {
        responseBody += line;
      }
      
      timeout = millis();
    }
  }
  
  Serial.println("Response: " + responseBody);
  
  client.stop();
  esp_camera_fb_return(fb);
  Serial.println("Image upload completed");
}
