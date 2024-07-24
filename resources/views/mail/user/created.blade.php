<x-mail::message>
Hello {{ $user->name }},

    Your account has been created successfully.

    **Here is your login infomation:** <br>
    Email: {{ $user->email }} <br>
    Password: {{ $password }}

    Please login to the system and change your password.

    <x-mail::button url="{{ route('login') }}">
    Click here to lgin    
    </x-mail::button>

Thank you, <br>
{{ config('app.name ')}}

</x-mail::message>