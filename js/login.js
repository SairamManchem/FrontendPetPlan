function validate() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    const options = {
        method: 'POST',
        url: 'http://localhost:3001/authenticate',
        params: {
            username: username,
            password: password
        }
    }
    if (username && password) {

        axios.request(options, { crossdomain: true }).then(response => {
            if (response.data === true) {
                document.location.href = "index.html";
            } else {
                alert("The Entered Username and Password is Wrong")
            }

        });
    } else {
        alert("Please Fill The Username and Password to Login");
    }



}