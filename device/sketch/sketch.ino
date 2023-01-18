#include <WiFi.h>
#include <FirebaseESP32.h>

// Provide the token generation process info.
#include <addons/TokenHelper.h>

// Provide the RTDB payload printing info and other helper functions.
#include <addons/RTDBHelper.h>

//DateTime
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 0;
const int   daylightOffset_sec = 3600;

/* 1. Define the WiFi credentials */
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""

// For the following credentials, see examples/Authentications/SignInAsUser/EmailPassword/EmailPassword.ino

/* 2. Define the API Key */
#define API_KEY "AIzaSyA7PPm1mpebQxM3BR2PjqX3XKT15d2x_o0"

/* 3. Define the RTDB URL */
#define DATABASE_URL "iot-firebase-a0460-default-rtdb.europe-west1.firebasedatabase.app" //<databaseName>.firebaseio.com or <databaseName>.<region>.firebasedatabase.app

/* 4. Define the user Email and password that alreadey registerd or added in your project */
#define USER_EMAIL "miralem.avdic24@gmail.com"
#define USER_PASSWORD "kikiriki"

const char* separator = "---------------------------------------";

// Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
unsigned long getLDRmetricPrevMillis = 0;
unsigned long count = 0;

//Photoresistor sensor (LDR)
const int LDR_PIN = 33;

const int minimum_sunlight = 172; //~8600 lux

int latest_LDR_metric = -1;

//Retrieves the latest photoresistor sensor readings
int getLDRmetric() {
  latest_LDR_metric = analogRead(LDR_PIN); 
  return latest_LDR_metric;
}

void initWifi(){
  //Establish WiFi connection
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println(separator);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println(separator);
}

void initFirebase(){

  // Serial.print("Firebase status: ");
}

void setup() {
  Serial.begin(115200);
  pinMode(LDR_PIN, INPUT); //Photoresistor (LDR) pin

  //Log metrics
  // Serial.print("Initial LDR metric: ");
  // Serial.println(getLDRmetric());

  initWifi();

  //Log Firebase version
  Serial.println(separator);
  Serial.println("Connecting to Firebase");
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the user sign in credentials */
  // auth.user.email = USER_EMAIL;
  // auth.user.password = USER_PASSWORD;

  /* Assign the callback function for the long running token generation task */
  // config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h

  // Or use legacy authenticate method
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = "DLpZBh6ygHNZtrrrKMQOqbTV4jctSNCGw0XRgwN6";

  // To connect without auth in Test Mode, see Authentications/TestMode/TestMode.ino

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Please make sure the device free Heap is not lower than 80 k for ESP32 and 10 k for ESP8266,
  // otherwise the SSL connection will fail.
  //////////////////////////////////////////////////////////////////////////////////////////////

  Firebase.begin(&config, &auth);

  // Comment or pass false value when WiFi reconnection will control by your code or third party library
  Firebase.reconnectWiFi(true);

  Firebase.setDoubleDigits(5);


  // // DateTime Sync - Init and get the time
  // configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  // // printLocalTime();
  Serial.println(separator);
}

void loop() {
  //Update photoresistor latest metrics
  if(millis() - getLDRmetricPrevMillis > 1000 || getLDRmetricPrevMillis == 0){
      getLDRmetricPrevMillis = millis();

      getLDRmetric();

      //Log metrics
      Serial.print("LDR metric updated: ");
      Serial.println(latest_LDR_metric);
  }

  // Firebase.ready() should be called repeatedly to handle authentication tasks.
  if (Firebase.ready() && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0))
  {
    Serial.println(separator);
    Serial.println("Firebase: Ready");
    Serial.print("Firebase loop index: ");
    Serial.println(count);
    
    sendDataPrevMillis = millis();

    // int iVal = 0;
    // Serial.printf("Get int ref... %s\n", Firebase.getInt(fbdo, F("/test/int"), &iVal) ? String(iVal).c_str() : fbdo.errorReason().c_str());

    // Serial.printf("Set string... %s\n", Firebase.setString(fbdo, F("/test/string"), "Hello World!") ? "ok" : fbdo.errorReason().c_str());

    // Serial.printf("Get string... %s\n", Firebase.getString(fbdo, F("/test/string")) ? fbdo.to<const char *>() : fbdo.errorReason().c_str());

    // For the usage of FirebaseJson, see examples/FirebaseJson/BasicUsage/Create_Edit_Parse.ino
    FirebaseJson metricsJSON;
    Serial.println("Creating JSON with metrics data...");

    //Setup incremental indexing for Firebase
    char firebase_db_path[24] = "/device01/metrics/LDR/";
    char countAsString[4];
    char fullPath[27];
    itoa(count, countAsString, 10);
    strcpy(fullPath, firebase_db_path);
    strcat(fullPath, countAsString);

    Serial.print("Updating metrics on path: ");
    Serial.println(fullPath); //Log path

    //Initialise JSON to send to Firebase
    Serial.println("Initialising JSON...");
    metricsJSON.set(F("ts/.sv"), F("timestamp"));
    metricsJSON.set(F("/LDRvalue"), latest_LDR_metric);
    if (count == 0)
    {
      Serial.printf("Set metrics json... %s\n", Firebase.set(fbdo, F(fullPath), metricsJSON) ? "ok" : fbdo.errorReason().c_str());
    }
    else
    {
      Serial.printf("Update node... %s\n", Firebase.updateNode(fbdo, F(fullPath), metricsJSON) ? "ok" : fbdo.errorReason().c_str());
    }


    // For generic set/get functions.

    // For generic set, use Firebase.set(fbdo, <path>, <any variable or value>)

    // For generic get, use Firebase.get(fbdo, <path>).
    // And check its type with fbdo.dataType() or fbdo.dataTypeEnum() and
    // cast the value from it e.g. fbdo.to<int>(), fbdo.to<std::string>().

    // The function, fbdo.dataType() returns types String e.g. string, boolean,
    // int, float, double, json, array, blob, file and null.

    // The function, fbdo.dataTypeEnum() returns type enum (number) e.g. fb_esp_rtdb_data_type_null (1),
    // fb_esp_rtdb_data_type_integer, fb_esp_rtdb_data_type_float, fb_esp_rtdb_data_type_double,
    // fb_esp_rtdb_data_type_boolean, fb_esp_rtdb_data_type_string, fb_esp_rtdb_data_type_json,
    // fb_esp_rtdb_data_type_array, fb_esp_rtdb_data_type_blob, and fb_esp_rtdb_data_type_file (10)

    count++;
    Serial.println(separator);
  }
}
