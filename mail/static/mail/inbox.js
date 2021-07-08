document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector("#compose-form").onsubmit = send_email;
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function send_email(){
  const form = document.querySelector("#compose-form");
  const recipients = form.querySelector("#compose-recipients");
  const subject = form.querySelector("#compose-subject");
  const body = form.querySelector("#compose-body");
  const data = {
    "recipients": recipients.value,
    "subject": subject.value,
    "body": body.value,
  };
  body.value = "";
  subject.value= "";
  recipients.value = "";
  fetch("/emails", {
    method: "POST", 
    body: JSON.stringify(data)
  }).then(res => {
    return res.json();
  }).then(data => {
    if(data.error){
    alert(data.error);}
    load_mailbox("sent");
  });
  return false;
}
function reply(mail){
  compose_email();
  const form = document.querySelector("#compose-form");
  const recipients = form.querySelector("#compose-recipients");
  const subject = form.querySelector("#compose-subject");
  const body = form.querySelector("#compose-body");
  recipients.value = mail.sender;
  subject.value = `Re: ${mail.subject}`;
  body.value = `On ${mail.timestamp} ${mail.sender} wrote: ${mail.body} \n`
}
function fetch_mailbox(mailbox) {
  fetch(`/emails/${mailbox}`).then(res => {
    return res.json()
  }).then(data => {
    const view = document.querySelector('#emails-view');
    data.forEach(x => {
      let mail = document.createElement("div");
      mail.classList.add("mail")
      mail.addEventListener("click", event => {fetch_mail(x,mailbox)});
      if (x.read){
        mail.style.backgroundColor = "grey";
      }
      else{
        mail.style.backgroundColor = "red";
      }
      let temp = document.createElement("p");
      temp.classList.add("mail-material")
      temp.innerHTML = x.timestamp;
      mail.append(temp)
      temp = document.createElement("p");
      temp.classList.add("mail-material")
      temp.innerHTML = `Sender: ${x.sender}`;
      mail.append(temp)
      temp = document.createElement("p");
      temp.classList.add("mail-material")
      temp.innerHTML = `Recipients: ${x.recipients}`;
      mail.append(temp)
      temp = document.createElement("p");
      temp.classList.add("mail-material")
      temp.innerHTML = `Subject: ${x.subject}`;
      mail.append(temp)
      view.append(mail)
    })
  })
}
function fetch_mail (x,mailbox){
  if (!x.read && mailbox == "inbox"){
    fetch(`/emails/${x.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  }
  const view = document.querySelector('#emails-view');
  view.innerHTML = "";
  let mail = document.createElement("div");
  if(mailbox == "inbox"){
    let button = document.createElement("button");
    button.innerHTML = "Archive";
    button.onclick = function(){
      fetch(`/emails/${x.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      }).then(res =>{
        return res.json}).then(data => {
        load_mailbox("inbox");
      })
    };
    button.classList.add("mailbuttons");
    mail.append(button);
    let button2 = document.createElement("button");
    button2.innerHTML = "Reply";
    button2.onclick = () => {reply(x)};
    button2.classList.add("mailbuttons");
    mail.append(button2);
  }
  if (mailbox == "archive"){
    let button = document.createElement("button");
    button.innerHTML = "Unarchive";
    button.onclick = function(){
      fetch(`/emails/${x.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      }).then(res =>{
        return res.json}).then(data => {
        load_mailbox("inbox");
      })
    };
    button.classList.add("mailbuttons");
    mail.append(button);
  }
  let temp = document.createElement("p");
  temp.classList.add("mail-material")
  temp.innerHTML = x.timestamp;
  mail.append(temp)
  temp = document.createElement("p");
  temp.classList.add("mail-material")
  temp.innerHTML = `Sender: ${x.sender}`;
  mail.append(temp)
  temp = document.createElement("p");
  temp.classList.add("mail-material")
  temp.innerHTML = `Recipients: ${x.recipients}`;
  mail.append(temp)
  temp = document.createElement("p");
  temp.classList.add("mail-material")
  temp.innerHTML = `Subject: ${x.subject}`;
  mail.append(temp)
  temp = document.createElement("textbox");
  temp.classList.add("mail-material")
  temp.innerHTML = `${x.body}`;
  mail.append(temp)
  view.append(mail)
}

function load_mailbox(mailbox) {
  fetch_mailbox(mailbox)
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}