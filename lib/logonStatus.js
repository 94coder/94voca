module.exports = {
  IsOwner: function (req, res) {
    return req.user ? true : false;
  },
};
