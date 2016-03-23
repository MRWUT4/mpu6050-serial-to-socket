#include<Wire.h>

const int MPU_ADDRESS = 0x68;  // I2C address of the MPU-6050
const int MPU_START_REGISTER = 0x3B;
const int MPU_BEGIN_REGISTER = 14;
const int MPU_POWER_REGISTER = 0x6B;

int gX,gY,gZ;

int accelValues[ 3 ] = { 0, 0, 0 };
int gyroValues[ 3 ] = { 0, 0, 0 };
int baseValues[ 3 ] = { 0, 0, 0 };
int outputValues[ 3 ] = { 0, 0, 0 };
int temperatureValue = 0;  


/**
 * Setup interface.
 */

void setup()
{
  initMPUTransmission();
}

void loop()
{
  updateSensorValues();
  updateBaseValues();
  updateOutputValues();
  updateSerialOutput();

  delay( 100 );
}


/**
 * Private functions.
 */

/** Parse sensor values to variables. */
void updateSensorValues()
{
  Wire.beginTransmission( MPU_ADDRESS );
  Wire.write( MPU_START_REGISTER ); // starting with register 0x3B (ACCEL_XOUT_H)
  Wire.endTransmission( false );
  Wire.requestFrom( MPU_ADDRESS, MPU_BEGIN_REGISTER, true ); // request a total of 14 registers

  gyroValues[ 0 ] = Wire.read()<<8|Wire.read(); // 0x3B (GYRO_XOUT_H) & 0x3C (GYRO_XOUT_L)    
  gyroValues[ 1 ] = Wire.read()<<8|Wire.read(); // 0x3D (GYRO_YOUT_H) & 0x3E (GYRO_YOUT_L)
  gyroValues[ 2 ] = Wire.read()<<8|Wire.read(); // 0x3F (GYRO_ZOUT_H) & 0x40 (GYRO_ZOUT_L)
  temperatureValue = Wire.read()<<8|Wire.read(); // 0x41 (TEMP_OUT_H) & 0x42 (TEMP_OUT_L)
  accelValues[ 0 ] = Wire.read()<<8|Wire.read(); // 0x43 (ACCEL_XOUT_H) & 0x44 (ACCEL_XOUT_L)
  accelValues[ 1 ] = Wire.read()<<8|Wire.read(); // 0x45 (ACCEL_YOUT_H) & 0x46 (ACCEL_YOUT_L)
  accelValues[ 2 ] = Wire.read()<<8|Wire.read(); // 0x47 (ACCEL_ZOUT_H) & 0x48 (ACCEL_ZOUT_L)
}


/** Sets first valid values as array [ x, y, z ] */
void updateBaseValues()
{
  boolean baseValuesSet = baseValues[ 0 ] != 0 && baseValues[ 1 ] != 0 && baseValues[ 2 ] != 0;
  boolean hasSensorValues = gyroValues[ 0 ] != 0 && gyroValues[ 1 ] != 0 && gyroValues[ 2 ] != 0;

  if( !baseValuesSet && hasSensorValues )
  {
    baseValues[ 0 ] = gyroValues[ 0 ];
    baseValues[ 1 ] = gyroValues[ 1 ];
    baseValues[ 2 ] = gyroValues[ 2 ];
  }
}


/** Returns sensor values with subtracted base values. */
void updateOutputValues()
{
  outputValues[ 0 ] = gyroValues[ 0 ] - baseValues[ 0 ];
  outputValues[ 1 ] = gyroValues[ 1 ] - baseValues[ 1 ];
  outputValues[ 2 ] = gyroValues[ 2 ] - baseValues[ 2 ];
}


/** Connect to MPU5060 board. */
void initMPUTransmission()
{
  Wire.begin();
  Wire.beginTransmission( MPU_ADDRESS );
  Wire.write( MPU_POWER_REGISTER );  // PWR_MGMT_1 register
  Wire.write( 0 );     // set to zero (wakes up the MPU-6050)
  Wire.endTransmission( true );
  
  Serial.begin( 9600 );
}


/** Wirte serial output. */
void updateSerialOutput()
{
  int x = outputValues[ 0 ];
  int y = outputValues[ 1 ];
  int z = outputValues[ 2 ];
  
  Serial.print( x );
  Serial.print(","); 
  Serial.print( y );
  Serial.print(","); 
  Serial.print( z ); 
  Serial.println();
}