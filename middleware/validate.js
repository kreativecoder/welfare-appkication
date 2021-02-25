export const isEmpty = name => {
  if (!name || name === "" || name === undefined) {
    return true;
  }
  return false;
};

export const isNameValid = name => {
  if (name.trim().match(/^[A-Za-z]+$/)) {
    return true;
  }
  return false;
};

export const isEmailValid = email => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(email)) {
    return true;
  }
  return false;
};

export const isPhoneNumberValid = phone => {
  // convert number to string
  const phoneNumStr = phone.split("");
  // check the length of the number
  // then check if number contains other number apart from number
  if (phoneNumStr.length === 11 && !phone.match(/[^0-9]/g)) {
    return true;
  }
  return false;
};
export const isNumberValid = phone => {
  if (!phone.match(/[^0-9]/g)) {
    return true;
  }
  return false;
};

export const isPasswordValid = password => {
  if (password.length > 6) {
    return true;
  }
  return false;
};
