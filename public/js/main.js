var helpers = {
    checkHomeAnchor: function(event)  {
        if($('#view').find('#home').length < 1) {
            $('#view').load('./views/home.html', function()  {
                main.checkLogin();
                $(document.body).trigger(event.type);
            });
        }
    },
    checkEmail: function(email){
        var regEmail = '(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])';
        var emailX = new RegExp(regEmail);
        var emailTest = emailX.test(email);
        return emailTest;
    },
    checkUserInput: function(data, checkMatchingPassword)  {
        var emailTest = helpers.checkEmail(data.email);
        var reg2Char = '[a-zA-Z0-9]{2,}';
        var reg2CharX = new RegExp(reg2Char);
        var nameTest = reg2CharX.test(data.name);
        var passwordTest = reg2CharX.test(data.password);
        var schoolTest = reg2CharX.test(data.school);

        if(emailTest && nameTest && passwordTest && schoolTest){
            if(!checkMatchingPassword) return {success:true};
            if(data.password === data.confirmPassword)return {success:true};
            return {success: false, message:'passwords dont match'};
        }
        else{
            var errorMessage = { succes: false, message: ''};
            if(!emailTest)errorMessage.message += ' Please enter a valid email \n';
            if(!nameTest)errorMessage.message += ' Please enter a name > 2 characters \n';
            if(!passwordTest)errorMessage.message += ' Please enter a password > 2 characters \n';
            if(!schoolTest)errorMessage.message += ' Please enter a school name \n';
            return errorMessage;
        }
    },
    navImageBackground: function()  {
        $("#hvcNav").removeClass("navbar-white-hvc");
        $("#hvcSNav").removeClass("navbar-white-hvc-a");
        $(".hvcLNav").removeClass("navbar-white-hvc-a");

        $("#hvcNav").addClass("navbar-image-hvc");
        $("#hvcSNav").addClass("navbar-image-hvc-a");
        $(".hvcLNav").addClass("navbar-image-hvc-a");
    },
    navWhiteBackground: function()  {
        $("#hvcNav").addClass("navbar-white-hvc");
        $("#hvcSNav").addClass("navbar-white-hvc-a");
        $(".hvcLNav").addClass("navbar-white-hvc-a");

        $("#hvcNav").removeClass("navbar-image-hvc");
        $("#hvcSNav").removeClass("navbar-image-hvc-a");
        $(".hvcLNav").removeClass("navbar-image-hvc-a");
    }
};

var main = {
    checkLogin: function()  {
        if(typeof localStorage.getItem('apiKey') === 'undefined' && localStorage.getItem('apiKey') === ''){ main.isLoggedIn({success: false});}
        else { $.get(url + '/isLoggedIn', {apiKey: localStorage.getItem('apiKey')}, main.isLoggedIn)}
    },
    doChangePassword: function(email)  {
        $('#view').load('./views/user/changePassword.html', function(){
            $('#emailChangePassword').html(email);
            $('#changePassword').click(function(){
                var changePasswordData = {
                    email: email,
                    passwordResetCode: $('#passwordResetCode').val(),
                    password: $('#passwordChange').val(),
                    confirmPassword: $('#confirmPasswordChange').val()
                };
                $.post(url+'/doChangePassword', changePasswordData, main.doChangePasswordDone)
            })
        })
    },
    doChangePasswordDone: function(result)  {
        if(result.success){
            alert(result.message);
        }
        else{
            alert('An error occured please try again.' + result.message);
        }
    },
    doManageProfile: function()  {
        var manageProfileData = {
            'apiKey': localStorage.getItem('apiKey'),
            'name': $('#profileName').val(),
            'school': $('#profileSchool').val(),
            'email': $('#profileEmail').val(),
            'other': $('#profileOther').val(),
            'rsvp': $('#profileRSVP').val()
        };
        var checkManageProfileData = helpers.checkUserInput(manageProfileData, false);
        checkManageProfileData.success ? $.post(url+'/doManageProfile', manageProfileData, main.doManageProfileDone) : alert(checkManageProfileData.message);
    },
    doManageProfileDone: function(result)  {
        alert(JSON.stringify(result.message));
        $('#view').load('./views/home.html', navImageBackground);
        main.checkLogin();
    },
    doRegister: function()  {
        var registrationData = {
            'name': $('#name').val(),
            'school': $('#school').val(),
            'email': $('#email').val(),
            'password': $('#password').val(),
            'confirmPassword': $('#confirmPassword').val(),
            'other': $('#other').val()
        };
        var checkRegister = helpers.checkUserInput(registrationData, true);
        checkRegister.success ? $.post(url+'/doRegister', registrationData, main.doRegisterDone):alert(checkRegister.message);
    },
    doRegisterDone: function(result)  {
        if(result.success){
            //todo modal here talkin about email
            $('#view').load('./views/user/signIn.html');
        }
        else{
            alert(result);
        }
    },
    doSignIn: function()  {
        var signInData = {
            'email': $('#email').val(),
            'password': $('#password').val()
        };
        $.post(url+'/doSignIn', signInData, main.doSignInDone)
    },
    doSignInDone: function(result)  {
        if(result.success){
            $('#view').load('./views/home.html', helpers.navImageBackground());
            localStorage.setItem('apiKey', result.apiKey);
            main.checkLogin();
        }
        else{
            alert(result.message);
        }
    },
    forgotPassword: function()  {
        var email = $('#email').val();
        if(helpers.checkEmail(email)){
            var confirmReset = confirm("An email with instructions on ressetting password will be sent to: " + email + " , do you wish to continue?");
            if(confirmReset){
                $.get(url+'/forgotPassword', {email: email}, main.forgotPasswordDone)
            }
        } else {
            alert('Please enter a valid email to continue.')
        }
    },
    forgotPasswordDone: function(result)  {
        if(result.success){
            main.doChangePassword(result.email);
        }
        else{
            alert('Failed to send password reset link, please try again.')
        }
    },
    isLoggedIn: function(result)  {
        if(result.success){
            $('.navUser').load('./views/nav/in.html', function(){
                $('#userEmail').html(result.email + '&nbsp <span class="caret"></span>');
            });
            $('.navHomeUser').load('./views/nav/navHomeIn.html');
        }
        else{
            localStorage.removeItem('apiKey');
            $('.navUser').load('./views/nav/out.html');
            $('.navHomeUser').load('./views/nav/navHomeOut.html');
        }
    },
    manageProfile: function(event)  {
        event.preventDefault();//So i can use a href styles without loading link
        $.get(url+'/getProfile', {apiKey: localStorage.getItem('apiKey')}, main.manageProfileDone);
    },
    manageProfileDone: function(result) {
        console.log(JSON.stringify(result))
        if(result.success){
            $('#view').load('./views/user/manageProfile.html', function(){
                $('#profileName').val(result.profile.name);
                $('#profileSchool').val(result.profile.school);
                $('#profileEmail').val(result.email);
                $('#profileOther').val(result.profile.other);
                $('#profileRSVP').val(result.profile.rsvp);
                helpers.navWhiteBackground();
            })
        }
        else{
            alert(result.message);
        }
    },
    register: function(event)  {
        event.preventDefault();//So i can use a href styles without loading link
        $('#view').load('./views/user/register.html', function(){
            helpers.navWhiteBackground();
        });
    },
    signOut: function(event)  {
        event.preventDefault();
        localStorage.removeItem('apiKey');
        $('#view').load('./views/home.html', helpers.navImageBackground());
        main.checkLogin();
    },
    signIn: function(event)  {
        event.preventDefault();//So i can use a href styles without loading link
        $('#view').load('./views/user/signIn.html', function(){
            helpers.navWhiteBackground();
        });
    }
};

var url = 'https://hackvolusia.com:8443';
$(document).ready(function() {

    $('#navspot').load('./views/nav/navbar.html');
    $('#view').load('./views/home.html');

    main.checkLogin();

    $(document.body).on('click','.register', main.register);
    $(document.body).on('click','.signIn', main.signIn);
    $(document.body).on('click','#doRegister', main.doRegister);
    $(document.body).on('click','#doSignIn', main.doSignIn);
    $(document.body).on('click','.signOut', main.signOut);
    $(document.body).on('click','.manageProfile', main.manageProfile);
    $(document.body).on('click','#doManageProfile', main.doManageProfile);
    $(document.body).on('click','#forgotPassword', main.forgotPassword);

    $(document.body).on('click','.homeAnchor', helpers.checkHomeAnchor);

    $(window).on("scroll",function(){
        var wn = $(window).scrollTop();
        if(wn > 50){
            helpers.navWhiteBackground();
        }
        else{
            helpers.navImageBackground();
        }
    });
});
