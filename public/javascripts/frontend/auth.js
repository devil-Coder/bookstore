/**
 * Created by Raj Chandra on 17-11-2017.
 */

$('.form-control').on('keyup',function(){
    var input=document.getElementById(this.id).value;
    switch(this.id){
        case 'name':
            if(input=='')
                alert('name is empty');
            break;
        case 'email':
            if(input=='')
                alert('email is empty');
            break;
        case 'phone':
            if(input=='')
                alert('mobile number is empty');
            break;
        case 'passwords':
            if(input=='')
                alert('password is empty');
            break;
    }
})
$('.form-control').on('submit',function(){
    alert('check the passwords');
})