let toastLive = did("liveToast");
let closeToast = did("closeToast");
let toastMsg = did("toastMsg");

eclick(closeToast, () => {
  toastLive.style = "display:none";
});

ekeyup(did("nickinputid"), () => {
  isValid("nick");
});

ekeyup(did("supportinputid"), () => {
  isValid("text", "supportinput", 1000);
});

ekeyup(did("supporttitleinputid"), () => {
  isValid("text", "supporttitleinput", 50);
});

ekeyup(did("pwdinputid"), () => {
  isValid("pwd");
});

const isValid = (what, where, length) => {
  switch (what) {
    case "text":
      if (
        did(where + "id").value.length > length ||
        did(where + "id").value.length == 0
      ) {
        did(where + "id").classList.replace("is-val", "is-invalid");
        did(where + "btn").disabled = true;
      } else {
        did(where + "id").classList.replace("is-invalid", "is-val");
        did(where + "btn").disabled = false;
      }
      break;
    case "nick":
    case "pwd":
      if (what == "nick") {
        formtesting = RegExp(/^(?=.*[a-zA-Z0-9가-힣])[a-zA-Z0-9가-힣]{2,10}$/);
      } else if (what == "pwd") {
        formtesting = RegExp(/^[a-zA-Z0-9]{6,18}$/);
      }
      if (!formtesting.test(did(what + "inputid").value)) {
        did(what + "inputid").classList.replace("is-val", "is-invalid");
        did(what + "inputbtn").disabled = true;
      } else {
        did(what + "inputid").classList.replace("is-invalid", "is-val");
        did(what + "inputbtn").disabled = false;
      }
      break;
  }
};

const tts = (id, text) => {
  fetch("/voca/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
      text: text,
    }),
  })
    .then((res) => res.arrayBuffer())
    .then((data) => {
      const context = new AudioContext();
      context.decodeAudioData(data, (buffer) => {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
      });
    });
};

eclick(did("open_setting"), () => {
  fetchg("/voca/get_user").then((user) => {
    did("user_email").innerText = "이메일 : " + user.email;
    did("user_nickname").innerText = "닉네임 : " + user.nickname;
    did("user_registered").innerText = "가입날짜 : " + user.registered;
  });
});

eclick(did("close_setting_btn"), () => {
  did("open_component").click();
});

eclick(did("nickinputbtn"), () => {
  fetchp("/signpage/modify_nick_check", {
    nickname: did("nickinputid").value,
  }).then((checked) => {
    if (checked == 0) {
      fetchp("/signpage/modify_nickname", {
        nickname: did("nickinputid").value,
      }).then((res) => {
        toastLive.style = "display:block";
        toastMsg.innerText = "닉네임이 변경되었습니다";
        did("mod_nick_cancle").click();
        did("open_component").click();
        did("open_setting").click();
      });
    } else {
      did("mod_nick_msg").innerText = "이미 존재하는 닉네임 입니다";
      did("nickinputid").classList.replace("is-val", "is-invalid");
    }
  });
});

eclick(did("pwdinputbtn"), () => {
  fetchp("/signpage/password_check", {
    password: did("now_pwd_id").value,
  }).then((checked) => {
    if (checked == 0) {
      did("now_pwd_id").classList.replace("is-val", "is-invalid");
    } else {
      fetchp("/signpage/modify_password", {
        password: did("pwdinputid").value,
      }).then((res) => {
        toastLive.style = "display:block";
        toastMsg.innerText = "비밀번호가 변경되었습니다";
        did("mod_pwd_cancle").click();
        did("open_component").click();
        did("open_setting").click();
      });
    }
  });
});

eclick(did("delete_check_btn"), () => {
  fetchp("/signpage/password_check", {
    password: did("del_pwd_id").value,
  }).then((checked) => {
    if (checked == 0) {
      did("del_pwd_id").classList.replace("is-val", "is-invalid");
    } else {
      did("delete_modal_first").classList.add("d-none");
      did("delete_modal_second").classList.remove("d-none");
      did("delete_check_btn").classList.add("d-none");
      did("delete_form_btn").classList.remove("d-none");
      did("del_modal_title").innerText = "회원탈퇴";
    }
  });
});

eclick(did("support-list-tab"), () => {
  fetchg("/voca/load_support").then((list) => {
    did("supportinputbtn").style = "display:none";
    let sup_list = "";
    for (let i = 0; i < list.length; i++) {
      if (list[i].checked == 1) {
        readed =
          "<span class='me-1 badge bg-success text-wrap'>답변 완료</span>";
      } else {
        readed =
          "<span class='me-1 badge bg-warning text-wrap'>답변 대기중</span>";
      }
      sup_list += `
        <div class="accordion-item">
          <h3 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#support_list_item${i}"
              aria-expanded="false"
              aria-controls="support_list_item${i}"
            >
              <div class=text-truncate>${readed} 문의 제목 : ${list[i].title}</div>
            </button>
          </h3>
          <div
            id="support_list_item${i}"
            class="accordion-collapse collapse"
            aria-labelledby="flush-headingOne"
            data-bs-parent="#accordionFlushExample"
          >
            <div class="accordion-body">
              <div class="position-relative mb-3"><h5>문의 내용</h5>
                <button type="button" class="btn btn-danger position-absolute top-0 end-0" data-bs-toggle="modal" data-bs-target="#delSupportModal" onclick="delSupport('${list[i].support_id}')">삭제</button></div>
              <div class="mb-5 text-break">${list[i].message}</div>
              <div class="mb-5">문의 날짜 : ${list[i].received}</div>
              <div>${list[i].answer}</div>
            </div>
          </div>
        </div>
      `;
    }
    did("support_accordion").innerHTML = sup_list;
  });
});

eclick(did("support-tab"), () => {
  did("supportinputbtn").style = "display:block";
});

eclick(did("supportinputbtn"), () => {
  fetchp("/voca/create_support", {
    title: did("supporttitleinputid").value,
    message: did("supportinputid").value,
  }).then((res) => {
    did("supporttitleinputid").value = "";
    did("supportinputid").value = "";
    toastLive.style = "display:block";
    toastMsg.innerText = "문의가 접수 되었습니다";

    did("support_cancle").click();
    did("open_component").click();
  });
});

eclick(did("delete_support_button"), () => {
  fetchp("/voca/delete_support", {
    id: did("selectedsupport").value,
  }).then((res) => {
    toastLive.style = "display:block";
    toastMsg.innerText = "문의가 삭제 되었습니다";
    did("cancle_delete_support").click();
    did("open_component").click();
    did("support-list-tab").click();
  });
});

const delSupport = (id) => {
  did("selectedsupport").value = id;
};

eclick(did("dark_mode_btn"), () => {
  if (
    !window.localStorage.getItem("dark_mode") ||
    window.localStorage.getItem("dark_mode") == "bright"
  ) {
    window.localStorage.setItem("dark_mode", "dark");
  } else {
    window.localStorage.setItem("dark_mode", "bright");
  }
  window.location.reload();
});
