module.exports = {
  IsOwner: (req, res) => {
    return req.user ? true : false;
  },
};
