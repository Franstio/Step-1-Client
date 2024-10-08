
import React, { useState, useEffect, Fragment } from "react";
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { IoSettingsOutline } from "react-icons/io5";
import { FiRefreshCcw } from "react-icons/fi";

import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import axios from "axios";
import io from 'socket.io-client';


const Home = () => {
    const [user, setUser] = useState(null);
    const [Scales4Kg, setScales4Kg] = useState({});
    const [Scales50Kg, setScales50Kg] = useState({});
    const [isFinalStep, setFinalStep] = useState(false);
    const [scanData, setScanData] = useState('');
    const socket = io('http://localhost:5000/'); // Sesuaikan dengan alamat server
    const navigation = [
        { name: 'Dashboard', href: '#', current: true },
        { name: 'Calculation', href: '#', current: false }
    ]

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    const BorderLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
        height: 10,
        borderRadius: 5,
        [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
        },
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 5,
            backgroundColor: value > 70 ? '#f44336' : theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
        },
    }));

    const CustomLinearProgress = ({ value }) => {
        return (
            <LinearProgress
                variant="determinate"
                value={value}
                color={value > 70 ? 'error' : 'primary'}
                style={{ width: '90%', height: 10, borderRadius: 5, marginRight: '10px' }}
            />
        );
    };

  useEffect(() => {
        socket.on ('data', (data) => {
        
            setScales4Kg(data)
        });
    }, []); 


    useEffect(() => {
        socket.emit('connectScale');
        socket.on('data1', (weight50Kg) => {
            try {
                weight50Kg.weight50Kg = weight50Kg && weight50Kg.weight50Kg ? parseFloat(weight50Kg.weight50Kg.replace("=", "") ?? '0') : 0;
                setScales50Kg(weight50Kg);
            }
            catch { }
        });
    }, []);


  const getScales4Kg = async () => {
//        const response = await axios.get("http://localhost:5000/Scales4Kg");

    }; 
/* 
    useEffect(() => {
        getScales4Kg();
        // Terima data dari server
        socket.on('data', (data) => {
        setScales4Kg(data.weight);
        });
    
        // Clean up saat komponen unmount
        return () => {
          socket.disconnect();
        };
      }, []); */

      const [hostName,setHostname] = useState('');

    
      async function sendControlRequest(address, value) {
        try {
            const response = await axios.post(`http://${hostName}.local/controlLock`, {
                address: address,
                value: value
            });
        } catch (error) {
            console.log(error.response.data.msg);
        }
    }
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (user == null)
                handleScan();
            else if (isFinalStep) {
            }
            else {
            }
        }
    };

    const handleScan = () => {
        axios.post('http://localhost:5000/ScanBadgeid', { badgeId: scanData })
            .then(res => {
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    if (res.data.user) {
                        setUser(res.data.user);
                        setScanData('');
                    } else {
                        alert("User not found");
                        setUser(null);
                        setScanData('');
                    }
                }
            })
            .catch(err => console.log(err));
    };





    return (
        <main>
            <Disclosure as="nav" className="bg-gray-800">
                {({ open }) => (
                    <>
                        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                            <div className="relative flex h-16 items-center justify-between">
                                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                    {/* Mobile menu button*/}
                                    <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                        <span className="absolute -inset-0.5" />
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                    <div className="flex flex-shrink-0 items-center">
                                        <img
                                            className="h-8 w-auto"
                                            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                                            alt="Your Company"
                                        />
                                    </div>
                                    <div className="hidden sm:ml-6 sm:block">
                                        <div className="flex space-x-4">
                                            {navigation.map((item) => (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    className={classNames(
                                                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                        'rounded-md px-3 py-2 text-sm font-medium'
                                                    )}
                                                    aria-current={item.current ? 'page' : undefined}
                                                >
                                                    {item.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                    <button
                                        type="button"
                                        className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                    >
                                        <span className="absolute -inset-1.5" />
                                        <span className="sr-only">View notifications</span>
                                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>

                                    {/* Profile dropdown */}
                                    <Menu as="div" className="relative ml-3">
                                        <div>
                                            <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                                <span className="absolute -inset-1.5" />
                                                <span className="sr-only">Open user menu</span>
                                                <IoSettingsOutline fontSize="1.5em" style={{ color: 'white' }} />
                                            </Menu.Button>
                                        </div>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="#"
                                                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                        >
                                                            Your Profile
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="#"
                                                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                        >
                                                            Settings
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="#"
                                                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                        >
                                                            Sign out
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </div>
                        </div>

                        <Disclosure.Panel className="sm:hidden">
                            <div className="space-y-1 px-2 pb-3 pt-2">
                                {navigation.map((item) => (
                                    <Disclosure.Button
                                        key={item.name}
                                        as="a"
                                        href={item.href}
                                        className={classNames(
                                            item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                            'block rounded-md px-3 py-2 text-base font-medium'
                                        )}
                                        aria-current={item.current ? 'page' : undefined}
                                    >
                                        {item.name}
                                    </Disclosure.Button>
                                ))}
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
            <div className='bg-[#f4f6f9] p-5'>
                <div className="grid grid-cols-3 grid-flow-col gap-5">
                <div className="col-span-1 ...">
                        <div className='flex-1 p-4 border rounded bg-white'>
                            <h1 className='text-blue-600 font-semibold mb-2 text-xl'>Bruto</h1>
                            <div className=''>
                                <div className='flex-1 flex justify-center p-4 border rounded bg-gray-200 text-5xl font-semibold'>{Scales4Kg.weight}<FiRefreshCcw size={20} /></div>
                                <p className='flex justify-center text-2xl font-bold'>Gram</p>
                            </div>
                        </div>
                    </div>
                    <div className="row-span-1">
                        <div className='flex-1 p-4 border rounded bg-white'>
                            <h1 className='text-blue-600 font-semibold mb-2 text-xl'>Neto</h1>
                            <div className=''>
                                <div className='flex-1 flex justify-center p-4 border rounded bg-gray-200 text-5xl font-semibold'>10.00 <FiRefreshCcw size={20} /></div>
                                <p className='flex justify-center text-2xl font-bold'>Gram</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 ...">
                        <div className='flex-1 p-4 border rounded bg-white'>
                            <h1 className='text-blue-600 font-semibold mb-2 text-xl'>Bruto</h1>
                            <div className=''>
                                <div className='flex-1 flex justify-center p-4 border rounded bg-gray-200 text-5xl font-semibold'>{Scales50Kg.weight50Kg}<FiRefreshCcw size={20} /></div>
                                <p className='flex justify-center text-2xl font-bold'>Kilogram</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 ...">
                        <div className='flex-1 p-4 border rounded bg-white'>
                            <h1 className='text-blue-600 font-semibold mb-2 text-xl'>Neto</h1>
                            <div className=''>
                                <div className='flex-1 flex justify-center p-4 border rounded bg-gray-200 text-5xl font-semibold'>10.00 <FiRefreshCcw size={20} /></div>
                                <p className='flex justify-center text-2xl font-bold'>Kilogram</p>
                            </div>
                        </div>
                    </div>
                    <div className="row-span-2 col-span-2">
                        <div className='flex-1 p-4 border rounded bg-white h-full'>
                            <h1 className='text-blue-600 font-semibold text-xl mb-3'>Scanner Result</h1>
                            <p>Please Scan..</p>
                            <input
                                type="text"
                                name="text"
                                id="userId"
                                value={scanData}
                                onKeyDown={e => handleKeyPress(e)}
                                onChange={e => setScanData(e.target.value)}
                                className="block w-full rounded-md border-0 py-2 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="luGGIatKmKvdMkcxpKc8SZD64ex5W0"
                            />
                            <button className='block w-full border rounded py-2 flex justify-center items-center font-bold mt-5 bg-sky-400 text-white text-lg'  onClick={() => sendControlRequest(5, 1)}>Submit</button>
                            <div className='text-lg mt-5'>
                            <p>Username: {user?.username} </p>
                            <p>Container Id: </p>
                            <p>Type Waste: </p>
                            </div>
                        </div></div>
                </div>

            </div>
            <footer className='flex-1 rounded border flex justify-center gap-40 p-3 bg-white'  >
                <p>Server Status: 192.168.1.5 Online</p>
                <p>Status PLC : Online</p>
            </footer>
        </main>
    );
};

export default Home;
