# FIT-IoT-Plantstat

This project relies on the Wokwi VSCode extension to simulate the ESP32 module.

## Requirements:
 - VSCode
 - Arduino IDE 1.x (2.x or higher doesn't work with the Arduino extension)
 - Wokwi account

### Setup Arduino VSCode extension (extension id: vsciot-vscode.vscode-arduino)
 - Download the extension
 - Go to Extension settings
 - Go to Workspace tab
 - Set the Arduino path to C:/Program Files (x86)/Arduino
 - Select the board F1 > Arduino: Board Manager > esp32 2.0.7
 - Select libraries F1 > Arduino: Library Manager > Firebase ESP32 by Mobizt 4.3.7
 - Build sketch F1 > Arduino: Verify

### Setup the Wokwi VSCode extension
 - Download the [extension](https://docs.wokwi.com/vscode/project-config)
 - Request a new licence F1 > Wokwi: Request a new licence
 - Should be automatically redirected to VSCode after obtaining the licence
   - If not, you can F1 > Wokwi: Manually enter licence key

### Run the Wokwi simulator
 - F1 > Wokwi: Start Simulator
