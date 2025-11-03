"use client";
import { LogIn } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side Image */}
      <div className="md:w-1/2 w-full h-[40vh] md:h-auto">
        
        <Image
        height={500}
        width={500}
                        className="w-full h-full object-cover"
                        src="/images/university.jpg"
                        alt="Background"
                        
                      />
      </div>

      {/* Right Side Content */}
      <div className="md:w-1/2 w-full flex flex-col justify-center items-center bg-gray-50 p-6 md:p-12 overflow-y-auto">
        {/* Logo */}
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-xl font-bold mr-2">
              A
            </div>
            <h1 className="text-2xl font-bold text-gray-800">ApplyTech</h1>
          </div>
          <p className="text-gray-600 text-center mb-8">
            Please login to continue your session!
          </p>

          {/* Login Form */}
          <form className="w-full space-y-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full rounded-full border border-gray-200 py-3 px-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-full border border-gray-200 py-3 px-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300"
                />
                Remember Me
              </label>
              <a href="#" className="text-indigo-600 hover:underline">
                Forgot Your Password?
              </a>
            </div>

            <button
              type="button"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
            >
              <LogIn />
              LOG IN
            </button>
          </form>
        </div>

        {/* Login Credentials Table */}
        <div className="mt-10 w-full max-w-3xl bg-white rounded-xl shadow-sm border overflow-x-auto">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-center mb-4">
              Login Credentials
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 border">Type</th>
                    <th className="py-3 px-4 border">Role</th>
                    <th className="py-3 px-4 border">Email</th>
                    <th className="py-3 px-4 border">Password</th>
                    <th className="py-3 px-4 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4 border font-semibold">
                      Tenant(Subscriber)
                    </td>
                    <td className="py-3 px-4 border">Admin</td>
                    <td className="py-3 px-4 border">john@apply.com</td>
                    <td className="py-3 px-4 border">applySaaS</td>
                    <td className="py-3 px-4 border text-center">
                      <button className="text-indigo-600 hover:text-indigo-800">
                        <i className="fa fa-copy" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border font-semibold">
                      Tenant Employee
                    </td>
                    <td className="py-3 px-4 border">Manager</td>
                    <td className="py-3 px-4 border">manager@apply.com</td>
                    <td className="py-3 px-4 border">applySaaS</td>
                    <td className="py-3 px-4 border text-center">
                      <button className="text-indigo-600 hover:text-indigo-800">
                        <i className="fa fa-copy" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border font-semibold">
                      Tenant Employee
                    </td>
                    <td className="py-3 px-4 border">Salesman</td>
                    <td className="py-3 px-4 border">sales@apply.com</td>
                    <td className="py-3 px-4 border">applySaaS</td>
                    <td className="py-3 px-4 border text-center">
                      <button className="text-indigo-600 hover:text-indigo-800">
                        <i className="fa fa-copy" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
