module.exports = {
  POST: (action, input) => {
    return `
    <form name="direction" id="formid" action="${action}" method="post">
      ${input}
    </form>
    <script>
      document.getElementById("formid").submit();
    </script>
    `;
  },

  HIDDEN: (fd_id, pr_id) => {
    return `
    <input type="hidden" name="fd_id" value="${fd_id}" />
    <input type="hidden" name="pr_id" value="${pr_id}" />
    `;
  },
};
