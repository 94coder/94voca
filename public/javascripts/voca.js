const selectFile = (file_id, file_name, folder_id, fav, sha) => {
  did("selected_file").value = file_id;
  did("selected_file_name").value = file_name;
  did("file_modal_name").innerText = file_name;
  did("file_modal_fd_id").value = folder_id;
  did("file_modal_fl_id").value = file_id;
  did("file_modal_fl_name").value = file_name;
  if (fav == 0) {
    did("file_modal_fav_img").src = "/icons/star0.png";
    did("file_modal_fav_text").innerText = "즐겨찾기 등록";
  } else {
    did("file_modal_fav_img").src = "/icons/star1.png";
    did("file_modal_fav_text").innerText = "즐겨찾기 해제";
  }
  if (sha == 0) {
    did("file_modal_sha_text").innerText = "단어장 공유하기";
  } else {
    did("file_modal_sha_text").innerText = "단어장 공유해제";
  }
};

const openFolderModal = (folder_name, folder_id, pr_id, fav, sha) => {
  did("folder_modal_name").innerText = folder_name;
  did("selected_sub_folder").value = folder_id;
  did("selected_parent").value = pr_id;
  if (fav == 0) {
    did("folder_modal_fav_img").src = "/icons/star0.png";
    did("folder_modal_fav_text").innerText = "즐겨찾기 등록";
  } else {
    did("folder_modal_fav_img").src = "/icons/star1.png";
    did("folder_modal_fav_text").innerText = "즐겨찾기 해제";
  }
  if (sha == 0) {
    did("folder_modal_sha_text").innerText = "폴더 공유하기";
  } else {
    did("folder_modal_sha_text").innerText = "폴더 공유해제";
  }
};

const moveFolder = (pr_id) => {
  did("move_selected_folder").value = pr_id;
  fetchp("/voca/load_move_folder", {
    pr_id: pr_id,
  }).then((list) => {
    const folder = list[0];
    let move_selected_folder = did("move_selected_folder").value;
    const selected_sub_folder = did("selected_sub_folder").value;
    did("move_folder_selected_folder_name").innerText = list[1][0].folder_name;
    move_selected_folder = list[1][0].folder_id;
    if (move_selected_folder == selected_sub_folder) {
      did("move_selected_folder").value = "";
      moveFolder(`${list[1][0].parent_id}`);
      toastLive.style = "display:block";
      toastMsg.innerText = "여기는 안돼요!";
    }
    let folder_list = "";
    let go_parent = `<i class="bi bi-arrow-left-circle fs-4 cursor" onclick="moveFolder('${list[1][0].parent_id}')"></i>`;
    if (list[1][0].parent_id == did("root_folder").value) {
      go_parent = `<i class="bi bi-arrow-left-circle fs-4 cursor" onclick="rootToast()"></i>`;
    }
    for (let i = 0; i < folder.length; i++) {
      folder_list += `
      <button class="folder p-3 text-center w-100" type="button" onclick="moveFolder('${folder[i].folder_id}')">
        <div class="d-flex flex-column">
          <i class="fa-solid fa-folder fs-1"></i>
          <span class="mt-2 text-break">${folder[i].folder_name}</span>
        </div>
      </button>
      `;
    }
    did("move_folder_area").innerHTML = folder_list;
    did("move_go_parent").innerHTML = go_parent;
  });
};

eclick(did("move_folder_btn"), () => {
  fetchp("/voca/move_folder", {
    fd_id: did("selected_sub_folder").value,
    mv_fd_id: did("move_selected_folder").value,
  }).then(() => {
    did("post_fd_id").value = did("selected_folder").value;
    did("toast_id").value = "폴더가 이동되었습니다";
    did("go_post").submit();
  });
});

const moveFile = (pr_id) => {
  did("move_selected_folder").value = pr_id;
  fetchp("/voca/load_move_folder", {
    pr_id: pr_id,
  }).then((list) => {
    const folder = list[0];
    did("move_file_selected_folder_name").innerText = list[1][0].folder_name;
    let folder_list = "";
    let go_parent = `<i class="bi bi-arrow-left-circle fs-4 cursor" onclick="moveFile('${list[1][0].parent_id}')"></i>`;
    if (list[1][0].parent_id == did("root_folder").value) {
      go_parent = `<i class="bi bi-arrow-left-circle fs-4 cursor" onclick="rootToast()"></i>`;
    }
    for (let i = 0; i < folder.length; i++) {
      folder_list += `
      <button class="folder p-3 text-center w-100" type="button" onclick="moveFile('${folder[i].folder_id}')">
        <div class="d-flex flex-column">
          <i class="fa-solid fa-folder fs-1"></i>
          <span class="mt-2 text-break">${folder[i].folder_name}</span>
        </div>
      </button>
      `;
    }
    did("move_file_area").innerHTML = folder_list;
    did("move_file_go_parent").innerHTML = go_parent;
  });
};

eclick(did("move_file_btn"), () => {
  fetchp("/voca/move_file", {
    fd_id: did("move_selected_folder").value,
    fl_id: did("selected_file").value,
  }).then(() => {
    did("post_fd_id").value = did("selected_folder").value;
    did("toast_id").value = "단어장이 이동되었습니다";
    did("go_post").submit();
  });
});

const rootToast = () => {
  toastLive.style = "display:block";
  toastMsg.innerText = "최상위 폴더 입니다";
};

ekeyup(did("newfolderid"), () => {
  isValid("text", "newfolder", 20);
});

ekeyup(did("newfileid"), () => {
  isValid("text", "newfile", 20);
});

ekeyup(did("createvocaid"), () => {
  isValid("text", "createvoca", 100);
});

ekeyup(did("renamefolderid"), () => {
  isValid("text", "renamefolder", 20);
});

eclick(did("go_back"), () => {
  fetchp("/voca/get_parent", {
    fd_id: did("selected_folder").value,
  }).then((result) => {
    did("post_fd_id").value = result;
    did("go_post").submit();
  });
});

eclick(did("newfolderbtn"), () => {
  fetchp("/voca/folder_check", {
    fd_id: did("selected_folder").value,
    new_fd_name: did("newfolderid").value,
  }).then((checked) => {
    if (checked == "0") {
      fetchp("/voca/create_folder", {
        fd_id: did("selected_folder").value,
        new_fd_name: did("newfolderid").value,
      }).then((result) => {
        did("post_fd_id").value = did("selected_folder").value;
        did("toast_id").value = "폴더가 생성되었습니다";
        did("go_post").submit();
      });
    } else {
      toastLive.style = "display:block";
      toastMsg.innerText = "해당 폴더내에 같은 폴더명이 존재합니다";
    }
  });
});

eclick(did("newfilebtn"), () => {
  fetchp("/voca/file_check", {
    fd_id: did("selected_folder").value,
    new_fl_name: did("newfileid").value,
  }).then((checked) => {
    if (checked == "0") {
      fetchp("/voca/create_file", {
        fd_id: did("selected_folder").value,
        new_fl_name: did("newfileid").value,
      }).then((result) => {
        selectFile(result);
        did("create_data_file_name").innerText =
          "단어장 : " + did("newfileid").value;
        did("create_data_modal_btn").click();
      });
    } else {
      toastLive.style = "display:block";
      toastMsg.innerText = "해당 폴더내에 같은 단어장명이 존재합니다";
    }
  });
});

eclick(did("finish_create_voca"), () => {
  did("post_fd_id").value = did("selected_folder").value;
  did("go_post").submit();
});

eclick(did("createvocabtn"), () => {
  fetchp("/voca/create_data", {
    fd_id: did("selected_folder").value,
    fl_id: did("selected_file").value,
    voca: did("createvocaid").value,
    voca_mean: did("createvmid").value,
    exam: did("createexamid").value,
    exam_mean: did("createemid").value,
  }).then((result) => {
    toastLive.style = "display:block";
    toastMsg.innerText = "단어가 추가되었습니다";
    did("createvocaid").value = "";
    did("createvmid").value = "";
    did("createexamid").value = "";
    did("createemid").value = "";
    did("createvocabtn").disabled = "true";
  });
});

eclick(did("go_study_btn"), () => {
  did("go_study_form").submit();
});

eclick(did("renamefolderbtn"), () => {
  let renamefoldername = did("renamefolderid").value;

  fetchp("/voca/parent_check", {
    fd_id: did("selected_sub_folder").value,
    new_fd_name: renamefoldername,
  }).then((checked) => {
    if (checked == "0") {
      fetchp("/voca/rename_folder", {
        fd_id: did("selected_sub_folder").value,
        new_fd_name: renamefoldername,
      }).then((changed) => {
        did("post_fd_id").value = did("selected_folder").value;
        did("toast_id").value = "폴더명이 변경되었습니다";
        did("go_post").submit();
      });
    } else {
      toastLive.style = "display:block";
      toastMsg.innerText = "해당 폴더내에 같은 폴더명이 존재합니다";
    }
  });
});

eclick(did("renamefilebtn"), () => {
  let fl_id = did("selected_file").value;
  let renamefilename = did("renamefileid").value;

  fetchp("/voca/file_check", {
    fd_id: did("selected_folder").value,
    new_fl_name: renamefilename,
  }).then((checked) => {
    if (checked == "0") {
      fetchp("/voca/rename_file", {
        fl_id: fl_id,
        new_fl_name: renamefilename,
      }).then((changed) => {
        did("post_fd_id").value = did("selected_folder").value;
        did("toast_id").value = "단어장명이 변경되었습니다";
        did("go_post").submit();
      });
    } else {
      toastLive.style = "display:block";
      toastMsg.innerText = "해당 폴더내에 같은 단어장명이 존재합니다";
    }
  });
});

eclick(did("del_folder_btn"), () => {
  fetchp("/voca/delete_folder", {
    fd_id: did("selected_sub_folder").value,
  }).then((result) => {
    did("post_fd_id").value = result;
    did("toast_id").value = "폴더가 삭제되었습니다";
    did("go_post").submit();
  });
});

eclick(did("del_file_btn"), () => {
  let selected_file = did("selected_file").value;
  fetchp("/voca/delete_file", {
    fl_id: selected_file,
  }).then((res) => {
    did("post_fd_id").value = did("selected_folder").value;
    did("toast_id").value = "단어장이 삭제되었습니다";
    did("go_post").submit();
  });
});

eclick(did("fd_fav_btn"), () => {
  fetchp("/voca/favorites_folder", {
    fd_id: did("selected_sub_folder").value,
  }).then((fav) => {
    if (fav == 0) {
      did("toast_id").value = "즐겨찾기가 해제되었습니다";
    } else {
      did("toast_id").value = "즐겨찾기에 등록되었습니다";
    }
    did("post_fd_id").value = did("selected_folder").value;
    did("go_post").submit();
  });
});

eclick(did("fl_fav_btn"), () => {
  fetchp("/voca/favorites_file", {
    fl_id: did("selected_file").value,
  }).then((fav) => {
    if (fav == 0) {
      did("toast_id").value = "즐겨찾기가 해제되었습니다";
    } else {
      did("toast_id").value = "즐겨찾기에 등록되었습니다";
    }
    did("post_fd_id").value = did("selected_folder").value;
    did("go_post").submit();
  });
});

eclick(did("sharing_fd_Btn"), () => {
  fetchp("/voca/share_folder", {
    fd_id: did("selected_sub_folder").value,
  }).then((sha) => {
    if (sha == 0) {
      did("toast_id").value = "공유가 해제되었습니다";
    } else {
      did("toast_id").value = "폴더가 공유되었습니다";
    }
    did("post_fd_id").value = did("selected_folder").value;
    did("go_post").submit();
  });
});

eclick(did("sharing_file_Btn"), () => {
  let selected_file = did("selected_file").value;
  fetchp("/voca/share_file", {
    fl_id: selected_file,
  }).then((result) => {
    if (result == 0) {
      did("toast_id").value = "공유가 해제되었습니다";
    } else {
      did("toast_id").value = "단어장이 공유되었습니다";
    }
    did("post_fd_id").value = did("selected_folder").value;
    did("go_post").submit();
  });
});

const setOrder = (id) => {
  if (id == 0) {
    did("order_id").value = 0;
  } else if (id == 1) {
    did("order_id").value = 1;
  } else if (id == 2) {
    did("order_id").value = 2;
  }
  did("set_order_form").submit();
};
