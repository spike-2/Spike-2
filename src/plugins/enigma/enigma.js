/**
 * An Enigma Machine emulator for the Enigma I without plugboard.  
 * 2021 Brandon Ingli  
 * https://portfolio.brandoningli.com/
 */
/**
 * A rotor for the Enigma I.
 */

class Rotor {
  /**
   * 
   * @param {string} [name=Rotor] Name to identify this rotor.
   * @param {number} [offset=0] The offset to start this rotor at.
   * @param {number[]} [key=identity mapping] Key to rotor's mapping. Array indexes are the forwards input. Values 0-25. Default: identity mapping
   * @param {number} [turnover=NaN] the number displaying when the next rotor rotates. For example, 17 (R) for a rotor that turns over the next one on Q->R. Default: no turnover
   */
  constructor(name, offset, key, turnover){
    this._name = (typeof name !== 'undefined') ? name : "Rotor";
    this.offset = (typeof offset !== 'undefined') ? offset : 0;
    this._key = (typeof key !== 'undefined') ? key : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    this._turnover = (typeof turnover !== 'undefined') ? turnover : NaN;
  }

  /**
   * Get the name of this rotor.
   * @return Rotor name
   */
  get name(){
    return this._name;
  }

  /**
   * Get this rotor's offset
   * @return Rotor offset
   */
  get offset(){
    return this._offset;
  }

  /**
   * Get this rotor's key
   * @return Rotor key
   */
  get key(){
    return this._key;
  }

  /**
   * Set this rotor's offset.
   * @param {number} nevVal The new offset 0 <= newVal <= 25
   * @throws 'Invalid Offset' when invalid parameter given
   */
  set offset(newVal){
    if (0 <= newVal <= 25){
      this._offset = newVal
    } else {
      throw 'Invalid Offset'
    }
  }

  /**
   * Rotate this rotor to the next position.
   */
  rotate(){
    this._offset = (this._offset + 1) % this.key.length;
  }

  /**
   * Determine if turnover has occurred.
   * @return true if next rotor should rotate, false otherwise
   */
  get rotateNeighbor(){
    return this._offset == this._turnover;
  }

  /**
   * Get the length of this rotor's key
   * @return rotor key length
   */
  get keyLen(){
    return this.key.length;
  }

  /**
   * Encode a number through the rotor forwards (right to left).
   * @param {number} input Input to the rotor
   * @returns {number} output of the rotor
   */
  encodeForward(input) {
    return this.key[input];
  }

  /**
   * Encode a number through the rotor backwards (left to right).
   * @param {number} input Input to the rotor
   * @returns output of the rotor
   */
  encodeBackward(input) {
    return this.key.indexOf(input);
  }
}

const RotorUtils = {
  /**
   * Key and Turnover values for Enigma I rotors.
   */
   rotorValues: {
    I: {
      key: [4, 10, 12, 5, 11, 6, 3, 16, 21, 25, 13, 19, 14, 22, 24, 7, 23, 20, 18, 15, 0, 8, 1, 17, 2, 9],
      turnover: 17 // Q to R
    },
    II: {
      key: [0, 9, 3, 10, 18, 8, 17, 20, 23, 1, 11, 7, 22, 19, 12, 2, 16, 6, 25, 13, 15, 24, 5, 21, 14, 4],
      turnover: 5 // E to F
    },
    III: {
      key: [1, 3, 5, 7, 9, 11, 2, 15, 17, 19, 23, 21, 25, 13, 24, 4, 8, 22, 6, 0, 10, 12, 20, 18, 16, 14],
      turnover: 21 // U to V
    },
    IV: {
      key: [4, 18, 14, 21, 15, 25, 9, 0, 24, 16, 20, 8, 17, 7, 23, 11, 13, 5, 19, 6, 10, 3, 2, 12, 22, 1],
      turnover: 10 // J to K
    },
    V: {
      key: [21, 25, 1, 17, 6, 8, 19, 24, 20, 15, 18, 3, 13, 7, 11, 23, 0, 22, 12, 9, 16, 14, 5, 4, 2, 10],
      turnover: 0 //Z to A
    }
  },

  /**
   * Keys for Enigma I reflectors.
   */
  reflectors: {
    A: {
      key: [4, 9, 12, 25, 0, 11, 24, 23, 21, 1, 22, 5, 2, 17, 16, 20, 14, 13, 19, 18, 15, 8, 10, 7, 6, 3]
    },
    B: {
      key: [24, 17, 20, 7, 16, 18, 11, 3, 15, 23, 13, 6, 14, 10, 12, 8, 4, 1, 5, 25, 2, 22, 21, 9, 0, 19]
    },
    C: {
      key: [5, 21, 15, 9, 8, 0, 14, 24, 4, 3, 17, 25, 23, 22, 6, 2, 19, 10, 20, 16, 18, 1, 13, 12, 7, 11]
    }
  },

  /**
   * Convert a cipher string of a rotor/reflector to an array representation.
   * @param {string} str Cipher String in alphabetic order (first pos maps A-> it)
   * @returns Mostly formatted array string representing the cipher numerically
   */
  stringToKey: function(str){
    var output="[";
    for(var char of str){
      output += (char.charCodeAt(0) - 65) + ", ";
    }
    output += "]";
    return output;
  },

  /**
   * Determine if string is a capital letter.
   * @param {string} str Character to check
   * @returns true if capital letter, false otherwise
   */
  isCapLetter: function(str) {
    return str.length === 1 && !!str.match(/[A-Z]/i);
  },

  /**
   * Adjust a value to account for offsets between rotors.
   * @param {number} value value to adjust
   * @param {Rotor} rotorA Entry rotor
   * @param {Rotor} rotorB exit rotor
   * @returns Adjusted value
   */
  adjustValue: function(value, rotorA, rotorB){
    value = value - rotorA.offset + rotorB.offset;
    while (value < 0){
      value += rotorA.keyLen;
    }
    return (value % rotorA.keyLen);
  }
}

/**
 * Encode or Decode a string in an Enigma Machine
 * @param {string} str String to encode/decode
 * @param {string} [r1=I] Name of rotor to use in rightmost position
 * @param {number} [r1o=0] starting offset for rightmost rotor, 0<=x<=25
 * @param {string} [r2=II] Name of rotor to use in center position
 * @param {number} [r2o=0] starting offset for center rotor, 0<=x<=25
 * @param {string} [r3=III] Name of rotor to use in leftmost position
 * @param {number} [r3o=0] starting offset for left rotor, 0<=x<=25
 * @param {string} [ref=B] Name of reflector to use
 * @returns Encoded/Decoded string
 * @throws 'Invalid Rotor: name' for invalid rotor names
 * @throws 'Invalid Rotor Offset: num' for invalid rotor offset
 * @throws 'Invalid Reflector: ref' for invalid reflector name
 */
function enigma(str, r1='I', r1o='0', r2='II', r2o='0', r3='III', r3o='0', ref='B'){
  str = str.toUpperCase();
  r1 = r1.toUpperCase();
  r2 = r2.toUpperCase();
  r3 = r3.toUpperCase();
  ref = ref.toUpperCase();

  r1o = parseInt(r1o);
  r2o = parseInt(r2o);
  r3o = parseInt(r3o);

  // Check rotor names
  for(var i of [r1, r2, r3]){
    if (!Object.keys(RotorUtils.rotorValues).includes(i)){
      throw 'Invalid Rotor: ' + i;
    }
  }
  // Check offsets
  for(var i of [r1o, r2o, r3o]){
    if (i < 0 || i > 25){
      throw 'Invalid Rotor Offset: ' + i;
    }
  }
  // Check reflector
  if(!Object.keys(RotorUtils.reflectors).includes(ref)){
    throw 'Invalid Reflector: ' + ref;
  }

  var rotorOne = new Rotor("Right: " + r1,
    r1o, 
    RotorUtils.rotorValues[r1].key,
    RotorUtils.rotorValues[r1].turnover);

  var rotorTwo = new Rotor("Center: " + r2,
    r2o, 
    RotorUtils.rotorValues[r2].key,
    RotorUtils.rotorValues[r2].turnover);

  var rotorThree = new Rotor("Left: " + r3,
    r3o, 
    RotorUtils.rotorValues[r3].key,
    RotorUtils.rotorValues[r3].turnover);

  var identity = new Rotor("Entry");

  var reflector = new Rotor("Reflector UKW-" + ref,
    0,
    RotorUtils.reflectors[ref].key,
    NaN
  )

  var output = "";

  for(var char of str){

    if(!RotorUtils.isCapLetter(char)){
      continue;
    }

    // Set rotors
    rotorOne.rotate();
    if (rotorOne.rotateNeighbor){
      rotorTwo.rotate();
      if (rotorTwo.rotateNeighbor){rotorThree.rotate();};
    }

    char = char.charCodeAt(0) - 65;
    char = RotorUtils.adjustValue(char, identity, rotorOne);

    // Forward Encode
    // Rotor One
    char = rotorOne.encodeForward(char);
    char = RotorUtils.adjustValue(char, rotorOne, rotorTwo);

    // Rotor Two
    char = rotorTwo.encodeForward(char);
    char = RotorUtils.adjustValue(char, rotorTwo, rotorThree);

    // Rotor Three
    char = rotorThree.encodeForward(char);
    char = RotorUtils.adjustValue(char, rotorThree, reflector);

    // Reflector
    char = reflector.encodeForward(char);
    char = RotorUtils.adjustValue(char, reflector, rotorThree);

    // Encode Backwards
    // Rotor Three
    char = rotorThree.encodeBackward(char);
    char = RotorUtils.adjustValue(char, rotorThree, rotorTwo);

    // Rotor Two
    char = rotorTwo.encodeBackward(char);
    char = RotorUtils.adjustValue(char, rotorTwo, rotorOne);

    // Rotor One
    char = rotorOne.encodeBackward(char);
    char = RotorUtils.adjustValue(char, rotorOne, identity);

    output += String.fromCharCode(char+65);
  }

  return output;
}

module.exports = {Rotor, RotorUtils, enigma};