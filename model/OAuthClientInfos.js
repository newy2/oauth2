module.exports = class OAuthClientInfos {
  async find({ clientId, clientSecret }) {
    throw new Error('Must be Override');
  }
}