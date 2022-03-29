
function copy() {

var copyText = document.getElementById("token")

copyText.select()
copyText.setSelectionRange(0, 99999); /* For mobile devices */

// console.log(copyText)
window.prompt("Copy to clipboard: Ctrl+C, Enter", copyText.value);

}
