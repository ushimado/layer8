/**
 * Layer8's basic wrapped JSON message, which formalizes certain details such as message type,
 * and status.  This allows for predicable message handler routing based on type.
 *
 * @class EnumeratedMessage
 */
class EnumeratedMessage {

  /**
   * Creates an instance of EnumeratedMessage.
   *
   * @param {String} type - Message type enumeration
   * @param {Object} body - JSON object
   * @param {string} [status='OK']
   * @memberof EnumeratedMessage
   */
  constructor(type, body, status='OK') {
    this.type = type;
    this.body = body;
    this.status = status;
  }

}

module.exports = EnumeratedMessage;
