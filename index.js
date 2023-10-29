const checkboxes = document.getElementsByClassName('checkBox');
for (let i = 0; i < checkboxes.length; i++) {
  checkboxes[i].addEventListener('click', function (e) {
    for (let j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].value !== e.target.value) {
        checkboxes[j].checked = false;
      }
    }
  });
}
