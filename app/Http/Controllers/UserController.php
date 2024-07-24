<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => ['required', 'email', 'unique:users,email'],
            'is_admin' => 'boolean'
        ]);
        // Generate and assign a random password
        // $rawPassword = Str::random(8);
        $rawPassword = '12345678';
        $data['password'] = bcrypt($rawPassword);
        $data['email_verified_at'] = now();

        $user = User::create($data);

        return redirect()->back();
    }

    public function changeRole(User $user)
    {
        $user->update(['is_admin' => !(bool) $user->is_admin]); // convert false to true || true to false   

        $message = "User role was changed into" . ($user->admin ? "Admin" : "Regular User");

        return response()->json(['message' => $message]);
    }

    public function blockUnblock(User $user)
    {
        if ($user->block_at) {
            $user->block_at = null;
            $message = "Your account has been activated";
        } else {
            $user->block_at = now();
            $message = 'Your account has been blocked';
        }
        $user->save();

        return response()->json(['message' => $message]);
    }
}
