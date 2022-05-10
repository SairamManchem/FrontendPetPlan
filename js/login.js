function validate() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    const options = {
        method: 'POST',
        // url: 'https://petplaninsurancenode.onrender.com/authenticate',
        url: 'https://petplaninsurancenodeserver.onrender.com/authenticate',
        params: {
            username: username,
            password: password
        }
    }
    if (username && password) {

        axios.request(options, { crossdomain: true }).then(response => {
            if (response.data === true) {
                document.location.href = "main.html";
            } else {
                alert("The Entered Username and Password is Wrong")
            }

        });
    } else {
        alert("Please Fill The Username and Password to Login");
    }



}