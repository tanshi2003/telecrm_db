// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// // import authService from '../services/authService';

// const UserSwitcher = () => {
//   const [activeSessions, setActiveSessions] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadSessions();
//   }, []);

//   const loadSessions = () => {
//     const sessions = authService.getActiveSessions();
//     const current = authService.getCurrentUser();
//     setActiveSessions(sessions);
//     setCurrentUser(current);
//   };

//   const handleSwitch = (userId) => {
//     const session = authService.switchUser(userId);
//     if (session) {
//       setCurrentUser(session);
//       setIsOpen(false);
      
//       // Redirect based on user role
//       if (session.user.role === 'admin') {
//         navigate('/admin/dashboard');
//       } else if (session.user.role === 'caller') {
//         navigate('/caller/dashboard');
//       }
//     }
//   };

//   const handleLogout = (userId) => {
//     authService.logout(userId);
//     loadSessions();
    
//     // If no active sessions, redirect to login
//     if (authService.getActiveSessions().length === 0) {
//       navigate('/login');
//     }
//   };

//   if (activeSessions.length === 0) {
//     return null;
//   }

//   return (
//     <div className="relative">
//       {/* Trigger Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
//       >
//         <img
//           src={currentUser?.user?.avatar || 'https://via.placeholder.com/32'}
//           alt="User"
//           className="w-8 h-8 rounded-full"
//         />
//         <span className="text-sm font-medium text-gray-700">
//           {currentUser?.user?.name || 'Switch User'}
//         </span>
//         <svg
//           className={`w-5 h-5 text-gray-400 transform ${isOpen ? 'rotate-180' : ''}`}
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>

//       {/* Dropdown Menu */}
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-1 z-50">
//           {activeSessions.map((session) => (
//             <div
//               key={session.user.id}
//               className={`px-4 py-2 hover:bg-gray-50 flex items-center justify-between ${
//                 currentUser?.user?.id === session.user.id ? 'bg-blue-50' : ''
//               }`}
//             >
//               <div className="flex items-center space-x-3">
//                 <img
//                   src={session.user.avatar || 'https://via.placeholder.com/32'}
//                   alt={session.user.name}
//                   className="w-8 h-8 rounded-full"
//                 />
//                 <div>
//                   <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
//                   <p className="text-xs text-gray-500 capitalize">{session.user.role}</p>
//                 </div>
//               </div>
              
//               <div className="flex items-center space-x-2">
//                 {currentUser?.user?.id !== session.user.id && (
//                   <button
//                     onClick={() => handleSwitch(session.user.id)}
//                     className="text-sm text-blue-600 hover:text-blue-800"
//                   >
//                     Switch
//                   </button>
//                 )}
//                 <button
//                   onClick={() => handleLogout(session.user.id)}
//                   className="text-sm text-red-600 hover:text-red-800"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//           ))}
          
//           <div className="border-t mt-1 pt-1 px-4 py-2">
//             <button
//               onClick={() => navigate('/login')}
//               className="text-sm text-blue-600 hover:text-blue-800 w-full text-left"
//             >
//               + Add Another Account
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserSwitcher; 