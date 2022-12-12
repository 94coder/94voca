const did = (id) => {
  return document.getElementById(id);
};

const eclick = (did, e) => {
  did.addEventListener("click", e);
};

const ekeyup = (did, e) => {
  did.addEventListener("keyup", e);
};

const fetchg = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

const fetchp = async (url, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data;
};

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

const scrollToBottom = () => {
  window.scrollTo(0, document.body.scrollHeight);
};
