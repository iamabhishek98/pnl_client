class Auth {
  constructor() {
    this.authenticated = false;
    this.name = "";
  }

  checkUser() {
    return true;
  }

  login(cb) {
    if (this.checkUser()) this.authenticated = true;
    cb();
  }

  logout(cb) {
    this.authenticated = false;
    cb();
  }

  isAuthenticated() {
    return this.authenticated;
  }
}

export default new Auth();
