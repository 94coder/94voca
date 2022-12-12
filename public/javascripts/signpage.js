const login_tab_link = did("login_tab_link");
const signup_tab_link = did("signup_tab_link");
let emailArea = did("email_area");
let pwdArea = did("pwd_area");
let pwdArea2 = did("pwd_area2");
let nickArea = did("nick_area");
const sbmBtn = did("sbm_Btn");
const alertid = did("alertid");
const signtabid = did("signtabid");

const formEmail = RegExp(/^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/);
const formPwd = RegExp(/^[a-zA-Z0-9]{6,18}$/);
const formNick = RegExp(/^(?=.*[a-zA-Z0-9가-힣])[a-zA-Z0-9가-힣]{2,10}$/);

const checkAbled = (status) => {
  switch (status) {
    case "e":
      if (!formEmail.test(emailArea.value)) {
        emailArea.classList.replace("is-val", "is-invalid");
        emailArea.classList.replace("is-valid", "is-invalid");
      } else {
        emailArea.classList.replace("is-val", "is-valid");
        emailArea.classList.replace("is-invalid", "is-valid");
      }
      break;
    case "p":
      if (!formPwd.test(pwdArea.value)) {
        pwdArea.classList.replace("is-val", "is-invalid");
        pwdArea.classList.replace("is-valid", "is-invalid");
      } else {
        pwdArea.classList.replace("is-val", "is-valid");
        pwdArea.classList.replace("is-invalid", "is-valid");
      }
      break;

    case "n":
      if (!formNick.test(nickArea.value)) {
        nickArea.classList.replace("is-val", "is-invalid");
        nickArea.classList.replace("is-valid", "is-invalid");
      } else {
        nickArea.classList.replace("is-val", "is-valid");
        nickArea.classList.replace("is-invalid", "is-valid");
      }
      break;

    case "eq":
      if (pwdArea.value !== pwdArea2.value) {
        pwdArea2.classList.replace("is-val", "is-invalid");
        pwdArea2.classList.replace("is-valid", "is-invalid");
      } else {
        pwdArea2.classList.replace("is-val", "is-valid");
        pwdArea2.classList.replace("is-invalid", "is-valid");
      }
      break;
  }
  if (
    emailArea.value &&
    pwdArea.value &&
    pwdArea2.value &&
    nickArea.value &&
    formEmail.test(emailArea.value) &&
    formPwd.test(pwdArea.value) &&
    formNick.test(nickArea.value) &&
    pwdArea.value === pwdArea2.value
  ) {
    sbmBtn.disabled = false;
  } else {
    sbmBtn.disabled = true;
  }
};

const goSubmit = () => {
  fetchp("/signpage/check_info", {
    email: emailArea.value,
    nickname: nickArea.value,
  }).then((check) => {
    if (check == "1") {
      alertid.innerText = "이미 존재하는 이메일 입니다";
      alertid.style = "display:block";
    } else if (check == "2") {
      alertid.innerText = "이미 존재하는 닉네임 입니다";
      alertid.style = "display:block";
    } else if (check == "3") {
      signtabid.submit();
    }
  });
};

eclick(did("findpwdbtn"), () => {
  did("spinnerbtn").classList.remove("d-none");
  did("findpwdbtn").classList.add("d-none");
  fetchp("/signpage/pwdmail", {
    email: did("findpwdemail").value,
  }).then((data) => {
    if (data == 1) {
      did("spinnerbtn").classList.add("d-none");
      did("findpwdbtn").classList.remove("d-none");
      did("closefindpwd").click();
      alertid.innerText = "이메일을 전송하였습니다. 확인해주세요";
      alertid.style = "display:block";
    } else if (data == 2) {
      did("spinnerbtn").classList.add("d-none");
      did("findpwdbtn").classList.remove("d-none");
      did("findpwdalerttext").innerText =
        "가입되지 않은 이메일입니다. 다시 확인해 주세요.";
      did("findpwdalert").classList.remove("d-none");
    }
  });
});

eclick(sbmBtn, goSubmit);

ekeyup(emailArea, () => {
  checkAbled("e");
});

ekeyup(pwdArea, () => {
  checkAbled("p");
});

ekeyup(pwdArea2, () => {
  checkAbled("eq");
});

ekeyup(nickArea, () => {
  checkAbled("n");
});

eclick(did("glbtnid"), () => {
  window.location.href = "/signpage/google";
});

eclick(did("klbtnid"), () => {
  window.location.href = "/signpage/kakao";
});

document.addEventListener("DOMContentLoaded", () => {
  new TypeIt("#site_intro_type1", {
    strings: "나만의 단어장 만들기",
    speed: 50,
    waitUntilVisible: true,
    cursor: false,
  }).go();
  new TypeIt("#site_intro_type2", {
    strings: "효과적으로 언어 공부를 해보세요",
    speed: 50,
    waitUntilVisible: true,
    startDelay: 1200,
    cursor: false,
  }).go();
});
