import axios from 'https://cdn.jsdelivr.net/npm/axios@1.3.5/+esm';
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

window.onload = async function () {
  console.log('Winodw onload!!!');
  const res = await axios.post(`${window.location.href}redis/getCache`);
  // console.log(res);
};