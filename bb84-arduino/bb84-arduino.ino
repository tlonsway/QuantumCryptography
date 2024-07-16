#include <SoftwareSerial.h>

const int laserPin = 7;

const int rxPin = 5;
const int txPin = 6;

//specified in equipment spec as 143360
const long long pulse_per_rev = 143360;

#define ARDUINO_WHOAMI 'E' //E for eve, A for alice, B for bob

#define CMD_GET_POSITION "GET_POS" //"GET_POS|dev" where "dev" is either 0 or 1, for primary and secondary waveplate respectively
#define CMD_SET_POSITION "SET_POS" //full command: "SET_POS|angle|dev" where angle is a floating point, and dev follows above rule
#define CMD_GET_INFO "GET_INFO" //not implemented
#define CMD_LASER_ON "LASER_ON"
#define CMD_LASER_OFF "LASER_OFF"
#define CMD_SAVE_ANGLE "SAVE_ANGLE" //"SAVE_ANGLE|dev" dev follows above rule(0 or 1)
#define CMD_PULSE "PULSE" //"PULSE|count" where "count" is the number of pulses
#define CMD_GENERATE_KEY "GENERATE_KEY" //"GENERATE_KEY|length" where length is the integer length of transmit bits (agreed key will be < 50% smaller after bb84)
#define CMD_GET_SENT_KEY "GET_SENT_KEY"
#define CMD_GET_HOME_ANGLE "GET_HOME_ANGLE" //"GET_HOME_ANGLE|dev" dev follows above rule(0 or 1)
#define CMD_SET_LISTENING "SET_LISTEN" //"SET_LISTEN|bool" bool=0 for stop listen or 1 for start listen
#define CMD_GET_RECV_KEY "GET_RECEIVE_KEY" 
#define CMD_RESET_RECV "RESET_RECEIVE"
#define CMD_RESET_TRANSMIT "RESET_TRANSMIT"
#define CMD_SET_WAVEPLATE_RECV "SET_WAVEPLATE_RECV" //"SET_WAVEPLATE_RECV|basis"
#define CMD_SET_WAVEPLATE_TRANSMIT "SET_WAVEPLATE_TRANSMIT" //"SET_WAVEPLATE_TRANSMIT|bit|basis"


#define CMD_SET_RECV_STATUS "SET_RECV_STATUS" //"SET_RECV_STATUS|status" status=0(do not receive) or 1(receive and hold on pulses)

#define CMD_SET_ADDRESS "SET_ADDRESS" //"SET_ADDRESS|address" where "address" is a numerical address in hex (use 0 or 1)
#define CMD_OVERRIDE_ADDRESS "OVERRIDE_ADDRESS"
int address_set = ((ARDUINO_WHOAMI == 'E') ? (0) : (1)); //will be set to 1 once address has been set (only applies to eve)

#define ELLB_GET_POSITION "gp"
#define ELLB_MOVE_ABSOLUTE "ma"

#define DEBUG_ON 0

#define detector0pin A1
#define detector1pin A0

SoftwareSerial ellb_serial = SoftwareSerial(rxPin, txPin);

String cmd = "";

// LASE SETTINGS
const long pulseTime = 500000; // uS
const long waitTime = 2000; // mS

// FOR READING BITS
unsigned long holdTime;

bool readingPulse;

float delV = 0.2;

float triggerLevel = 0.5;

bool manualMode = false; // Controls if new base is auto selected

int currentReadBase; // 0 or -45

double home_deg[2] = {0};

#define buffer_size 256 //the maximum length for a key

uint8_t send_bits_and_bases[buffer_size] = {0}; //for each byte: LSB stores bit, 2nd LSB stores basis
int send_index = 0;

uint8_t recv_bits_and_bases[buffer_size] = {0};
int recv_index = 0;

int current_receive_basis = 0;

int listening = 0; //will hold while receiving a pulse

void setup() {
  pinMode(rxPin, INPUT);
  pinMode(txPin, OUTPUT);
  pinMode(laserPin, OUTPUT);

  ellb_serial.begin(9600);

  Serial.begin(9600);
  digitalWrite(laserPin, LOW);
}

void loop() {
  check_serial();
  if (listening) {
    int pulse_reading = readPulse();
    if (pulse_reading != -1) {
      debug("read pulse: " + String(pulse_reading));
      recv_bits_and_bases[recv_index] = (pulse_reading | (current_receive_basis << 1));
      debug("updated");
      recv_index += 1;
      next_random_receive_basis();
      if (ARDUINO_WHOAMI == 'E') {
        repeat_pulse(pulse_reading);
      }
    }
  }
}

void check_serial() {
  while(Serial.available() > 0) {
    char c = Serial.read();
    cmd += c;
    if (c == '\n') {
      process_command(cmd);
      cmd = "";
    }
  }
}

void debug(String msg) {
  if (DEBUG_ON)
    Serial.println("[DEBUG] " + msg);
}

void process_command(String command) {
  command.toUpperCase();
  debug(command);
  if (!(command.startsWith(CMD_SET_ADDRESS) || command.startsWith(CMD_OVERRIDE_ADDRESS)) && address_set == 0) {
    //print_to_pi("address not set");
    debug("running command before address set on Eve");
    return;
  }
  if (command.startsWith(CMD_GET_POSITION)) {
    char dev = command.substring(1+command.indexOf('|')).c_str()[0];
    run_cmd_get_position(dev);
  } else if (command.startsWith(CMD_SET_POSITION)) {
    double ang = command.substring(1+command.indexOf('|')).toDouble();
    char dev = command.substring(1+command.lastIndexOf('|')).c_str()[0];
    run_cmd_set_position(ang, dev);
  } else if (command.startsWith(CMD_GET_INFO)) {
    run_cmd_get_info();
  } else if (command.startsWith(CMD_LASER_ON)) {
    run_cmd_laser_on();
  } else if (command.startsWith(CMD_LASER_OFF)) {
    run_cmd_laser_off();
  } else if (command.startsWith(CMD_SAVE_ANGLE)) {
    char dev = command.substring(1+command.lastIndexOf('|')).c_str()[0];
    run_cmd_save_angle(dev);
  } else if (command.startsWith(CMD_GET_HOME_ANGLE)) {
    char dev = command.substring(1+command.lastIndexOf('|')).c_str()[0];
    run_cmd_get_home_angle(dev);
  } else if (command.startsWith(CMD_PULSE)) {
    int pulses = command.substring(1+command.lastIndexOf('|')).toInt();
    run_cmd_pulse(pulses);
  } else if (command.startsWith(CMD_SET_ADDRESS)) {
    char address = command.substring(1+command.lastIndexOf('|')).c_str()[0];
    run_cmd_set_address(address);
  } else if (command.startsWith(CMD_OVERRIDE_ADDRESS)) {
    address_set = 1;
  } else if (command.startsWith(CMD_GENERATE_KEY)) {
    int length = command.substring(1+command.lastIndexOf('|')).toInt();
    run_cmd_generate_key(length);
  } else if (command.startsWith(CMD_GET_SENT_KEY)) {
    run_cmd_get_sent_key();
  } else if (command.startsWith(CMD_SET_LISTENING)) {
    int listen = command.substring(1+command.lastIndexOf('|')).toInt();
    run_cmd_set_listening(listen);
  } else if (command.startsWith(CMD_GET_RECV_KEY)) {
    run_cmd_get_recv_key();
  } else if (command.startsWith(CMD_RESET_RECV)) {
    run_cmd_reset_recv();
  } else if (command.startsWith(CMD_RESET_TRANSMIT)) {
    run_cmd_reset_transmit();  
  } else if (command.startsWith(CMD_SET_WAVEPLATE_RECV)) {
    int basis = command.substring(1+command.lastIndexOf('|')).toInt();
    set_waveplate_position_for_receive(basis, '0');
  } else if (command.startsWith(CMD_SET_WAVEPLATE_TRANSMIT)) {
    int bit = command.substring(1+command.indexOf('|')).toInt();
    int basis = command.substring(1+command.lastIndexOf('|')).toInt();
    char dev = '0';
    if (ARDUINO_WHOAMI == 'E') {
      dev = '1';
    }
    set_waveplate_position_for_transmit(bit,basis,dev);
  }
}

void run_cmd_get_position(char dev) {
  double cur_rot_pos = get_rotation_position(dev);
  print_to_pi(String(cur_rot_pos));
}

void run_cmd_set_position(double deg, char dev) {
  long pulses = degrees_to_pulses(deg);
  debug("got " + String(pulses) + " pulses");
  set_rotation_position(degrees_to_pulses(deg), dev);
}

void run_cmd_get_info() {
  //todo
}

void run_cmd_laser_on() {
  digitalWrite(laserPin, HIGH);
}

void run_cmd_laser_off() {
  digitalWrite(laserPin, LOW);
}

void run_cmd_save_angle(char dev) {
  double cur_angle = get_rotation_position(dev);
  home_deg[(int)dev - 48] = cur_angle;
}

void run_cmd_get_home_angle(char dev) {
  print_to_pi(String(home_deg[(int)dev - 48]));
}

void run_cmd_pulse(int pulse_count) {
  long startTime = millis();
  for (int i = 0; i < pulse_count; i++)
  {
    send_pulse();
    if (millis() - startTime > 600000)
    {
      break;
    }
  }
}

void run_cmd_set_address(char address) {
  ellb_send("0ca" + String(address));
  address_set = 1;
}

void run_cmd_generate_key(int length) {
  for(int i=0;i<length;++i) {
    int bit = random(0,2);
    int basis = random(0,2);
    //int basis = 0;
    send_bits_and_bases[send_index] = (bit | (basis << 1));
    send_index += 1;
    char dev = '0';
    if (ARDUINO_WHOAMI == 'E') {
      dev = '1';
    }
    set_waveplate_position_for_transmit(bit, basis, dev);
    delay(50); //wait for waveplate to move
    send_pulse();
    delay(1000);
  }
}

void run_cmd_get_sent_key() {
  for(int i=0;i<send_index;i++) {
    print_chunk_to_pi(String(send_bits_and_bases[i] & 1) + " ");
  }
  print_chunk_to_pi("|");
  for(int i=0;i<send_index;i++) {
    print_chunk_to_pi(String((send_bits_and_bases[i] & 2) >> 1) + " ");
  }
  conclude_chunk();
}

void run_cmd_prepare_receive() {
  debug("preparing to receive transmission");
  next_random_receive_basis();
}

void run_cmd_set_listening(int listen) {
  listening = listen;
}

void run_cmd_get_recv_key() {
  debug("returning received key");
  for(int i=0;i<recv_index;i++) {
    print_chunk_to_pi(String(recv_bits_and_bases[i] & 1) + " ");
  }
  print_chunk_to_pi("|");
  for(int i=0;i<recv_index;i++) {
    print_chunk_to_pi(String((recv_bits_and_bases[i] & 2) >> 1) + " ");
  }
  conclude_chunk();
}

void run_cmd_reset_recv() {
  recv_index = 0;
}

void run_cmd_reset_transmit() {
  send_index = 0;
}

void send_pulse() {
  digitalWrite(laserPin, HIGH);
  delayMicroseconds(pulseTime);
  digitalWrite(laserPin, LOW);
  delay(waitTime);
}

void next_random_receive_basis() {
  current_receive_basis = random(2);
  char dev = '0';
  debug("setting next recv basis to " + String(current_receive_basis));
  set_waveplate_position_for_receive(current_receive_basis, dev);
}

double get_rotation_position(char dev) {
  String pos_str = ellb_send(String(dev) + ELLB_GET_POSITION);
  debug("pos str: " + pos_str);
  if (pos_str.substring(1).startsWith("PO")) { //substring 1 to ignore address
    String dat_substr = pos_str.substring(3);
    long pulses = encoded_to_pulses(dat_substr);
    debug("got pulses: " + String(pulses));
    double deg = pulses_to_degrees(encoded_to_pulses(dat_substr));
    return deg;
  }
  return -1;
}

void set_rotation_position(long long pulses, char dev) {
  String encoded_pulses = pulses_to_encoded(pulses);
  debug("set_rot_pos_pulses: " + encoded_pulses);
  String ser_msg = String(dev) + ELLB_MOVE_ABSOLUTE + pulses_to_encoded(pulses);
  ellb_send(ser_msg);
}

String ellb_send(String data) {
  debug("sending to ellb: " + data);
  ellb_serial.print(data);
  return ellb_recv();
}

String ellb_recv() {
  String dat = "";
  while (!dat.endsWith("\n")) {
    if (ellb_serial.available() > 0) {
      dat += char(ellb_serial.read());
    }
  }
  dat.trim();
  return dat;
}

void print_chunk_to_pi(String msg_chunk) {
  Serial.print(msg_chunk);
}

void conclude_chunk() {
  Serial.println("");
}

void print_to_pi(String msg) {
  Serial.println(msg);
}

//convert ellb position response data(only 8 byte data segment) to enoder pulses
long long encoded_to_pulses(String msg_dat) {
  return strtol(msg_dat.c_str(), NULL, 16);
}

//only encodes the 8 byte data segment, without the header attaches
String pulses_to_encoded(long long pulses) {
  String ret = String((long)pulses, HEX);
  ret.toUpperCase();
  return zpad(ret,8);
}

long long degrees_to_pulses(double degrees) {
  return (degrees / 360) * pulse_per_rev;
}

double pulses_to_degrees(long long pulses) { 
  return ((double)pulses / pulse_per_rev) * 360;
}

//len is the length the string should be, after zero padding
String zpad(String s, int len) {
  String ret = s;
  while(ret.length() < len) {
    ret = "0" + ret;
  }
  return ret;
}

void set_waveplate_position_for_transmit(int bit, int basis, char dev) { //bit must be 0 or 1, basis is [0: rectilinear, 1: diagonal], dev is 0 or 1
  // basis | bit | angle(degrees relative to homing angle of 90 deg)
  //   0   |  0  |   0
  //   0   |  1  |  +45
  //   1   |  0  |  -22.5
  //   1   |  1  |  +22.5
  debug("sending bit and basis: " + String(bit) + " " + String(basis));
  double angle = home_deg[(int)dev - 48];
  if (bit == 1) {
    angle += 45;
  }
  if (basis == 1) {
    angle -= 22.5;
  }
  set_rotation_position(degrees_to_pulses(angle), dev);
}

void set_waveplate_position_for_receive(int basis, char dev) {
  double angle = home_deg[(int)dev - 48];
  if (basis == 1) {
    angle += 22.5;
  }
  set_rotation_position(degrees_to_pulses(angle), dev);
}

int readPulse() {
  float detector0Voltage = 5.0 * (analogRead(detector0pin) / 1023.0);
  float detector1Voltage = 5.0 * (analogRead(detector1pin) / 1023.0);
  
  double currentMax0 = 0;
  double currentMax1 = 0;

  readingPulse = (detector0Voltage >= triggerLevel || detector1Voltage >= triggerLevel);

  if (!readingPulse) {
    return -1;
  }
  while (readingPulse) {
    detector0Voltage = 5.0 * (analogRead(detector0pin) / 1023.0);
    detector1Voltage = 5.0 * (analogRead(detector1pin) / 1023.0);
    currentMax0 = fmax(currentMax0, detector0Voltage);
    currentMax1 = fmax(currentMax1, detector1Voltage);
    readingPulse = (detector0Voltage >= triggerLevel || detector1Voltage >= triggerLevel);
  }

  if (currentMax1 - currentMax0 > delV) {
    return 1; 
  } else if (currentMax0 - currentMax1 > delV) {
    return 0;
  } else {
    return random(2); // return 0 or 1 to simulate random choice
  }
}

void repeat_pulse(int bit) {
  debug("repeating a bit");
  int retransmit_basis = random(2);
  set_waveplate_position_for_transmit(bit, retransmit_basis, '1');
  delay(50);
  send_pulse();
}
