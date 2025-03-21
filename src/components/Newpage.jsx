import React, { useState, useEffect, Fragment, useRef } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { IoSettingsOutline } from "react-icons/io5";
import { FiRefreshCcw } from "react-icons/fi";

import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import Pagination from "@mui/material/Pagination";
import { DataGrid } from "@mui/x-data-grid";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import axios from "axios";
import { io } from "socket.io-client";
const apiClient = axios.create({
  withCredentials: false,
  timeout: 5000,
  validateStatus: function (status) {
    return status < 500;
  },
});
const step1Client = axios.create({
  withCredentials: false,
  timeout: 2000,
  validateStatus: function (status) {
    return status < 500;
  },
});
step1Client.interceptors.response.use(
  (res) => res,
  (err) => err
);
const Home = () => {
  const [apiTarget, setApiTarget] = useState(
    /*'192.168.54.128'*/ process.env.REACT_APP_PIDSG
  );
  const [user, setUser] = useState(null);
  const [transaction, setTransaction] = useState([]);
  const [Scales4Kg, setScales4Kg] = useState({});
  const [Scales50Kg, setScales50Kg] = useState({});
  const [isFinalStep, setFinalStep] = useState(false);
  const [scanData, setScanData] = useState("");
  const [errModal, toggleErrorModal] = useState({ show: false, message: "" });
  const [container, setContainer] = useState(null);
  const [machine, setMachine] = useState(null);
  const [waste, setWaste] = useState(null);
  const [wastename, setWastename] = useState("");
  const [Idbin, setIdbin] = useState(-1);
  const [containerName, setContainerName] = useState("");
  const [isFreeze, freezeNeto] = useState(false);
  const [isSubmitAllowed, setIsSubmitAllowed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalDispose, setShowModalDispose] = useState(false);
  const [showModalInfo, setShowModalInfo] = useState(false);
  const [finalneto, setFinalNeto] = useState(0);
  const [neto, setNeto] = useState({});
  const [neto50Kg, setNeto50kg] = useState(0);
  const [neto4Kg, setNeto4kg] = useState(0);
  const [toplockId, settoplockId] = useState({ hostname: "" });
  const [instruksimsg, setinstruksimsg] = useState("");
  const [message, setmessage] = useState("");
  const [type, setType] = useState("");
  const [typecollection, setTypeCollection] = useState("");
  const [binDispose, setBinDispose] = useState({});
  const [binId, setbinInd] = useState("");
  const [binname, setbinname] = useState("");
  const [wastenamebin, setwastenamebin] = useState();
  const [wastedid, setwasteid] = useState("");
  const [binqr, setbinqr] = useState("");
  const [logindate, setlogindate] = useState("");
  const [bottomLockHostData, setBottomLockData] = useState({
    binId: "",
    hostname: "",
  });
  const [socket, setSocket] = useState(); // Sesuaikan dengan alamat server
  const [btnInfo, setBtnInfo] = useState(true);
  const btnRef = useRef();
  const inputRef = useRef();
  const navigation = [{ name: "Dashboard", href: "#", current: false }];

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const BorderLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor:
        value > 70
          ? "#f44336"
          : theme.palette.mode === "light"
          ? "#1a90ff"
          : "#308fe8",
    },
  }));
  useEffect(() => {
    setSocket(io(`http://${process.env.REACT_APP_API}`));
  }, []);
  useEffect(() => {
    if (!socket) return;
    socket.on("UpdateStep1", () => {
      getTransactionList();
    });
  }, [socket]);
  const handleScan = () => {
    apiClient
      .post(`http://${process.env.REACT_APP_API}/ScanBadgeid`, {
        badgeId: scanData.trim().replace(" ", ""),
      })
      .then((res) => {
        if (res.data.error) {
          setScanData("");
          toggleErrorModal({ show: true, message: res.data.error });
        } else {
          if (res.data.user) {
            setUser(res.data.user);
            setScanData("");
            setmessage("Scan Bin Machine/Bin");
          } else {
            toggleErrorModal({ message: "User not found", show: true });
            setUser(null);
            setScanData("");
          }
        }
      })
      .catch((err) => console.log(err));
  };

  const handleScan1 = async () => {
    try {
      const res = await apiClient.post(
        `http://${process.env.REACT_APP_API}/ScanMachine/`,
        { machineId: scanData.trim().replace(" ", "") }
      );
      if (res.data.error) {
        setScanData("");
        toggleErrorModal({ show: true, message: res.data.error });
      } else {
        if (res.data.machine) {
          /*if ( waste != null && res.data.container.IdWaste != waste.IdWaste ) {
                        alert("Waste Mismatch");
                        return;
                    }*/
          setWaste(res.data.machine.waste);
          setmessage("");
          setTypeCollection(res.data.machine.type);
          setWastename(res.data.machine.waste.name);
          setScanData("");
          setIsSubmitAllowed(false);
          setMachine(res.data.machine);
          setType(res.data.machine.type);
          //setShowModalInfo(true);
          setContainerName(res.data.machine.name);
          setBinDispose(res.data.machine.waste.bin);
          setwastenamebin(res.data.machine.waste);

          setFinalStep(true);
        } else {
          toggleErrorModal({ show: true, message: "Container Not Found" });
          setUser(null);
          setMachine(null);
          setContainerName(res.data.name || "");
          setScanData("");
          setIsSubmitAllowed(false);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleScan2 = async () => {
    try {
      const res = await apiClient.post(
        `http://${process.env.REACT_APP_API}/ScanContainer/`,
        { containerId: scanData.trim().replace(" ", "") }
      );
      if (res.data.error) {
        setScanData("");
        toggleErrorModal({ show: true, message: res.data.error });
      } else {
        if (res.data.container) {
          /*if ( waste != null && res.data.container.IdWaste != waste.IdWaste ) {
                        alert("Waste Mismatch");
                        return;
                    }*/

          const _res1 = await saveDataTransaksi(res.data.container);
          if (!_res1) {
            getTransactionList();
            toggleErrorModal({
              show: true,
              message: "Transaksi Gagal, Data tidak tersimpan",
            });
            return;
          }
          setWaste(res.data.container.waste);
          setmessage("");
          setTypeCollection(res.data.container.type);
          setWastename(res.data.container.waste.name);
          setwasteid(res.data.container.waste.name);
          setScanData("");
          setIsSubmitAllowed(false);
          setContainer(res.data.container);
          setType(res.data.container.type);
          //setShowModalInfo(true);
          setContainerName(res.data.container.name);
          setBinDispose(res.data.container.waste.bin);
          setwastenamebin(res.data.container.waste);
          setbinInd(res.data.container.name);
          setFinalStep(false);
          setShowModalInfo(true);

          //await sendDataToStep2();
          //updatelinecontainer();
        } else {
          toggleErrorModal({
            show: true,
            "Container Not Fount": res.data.error,
          });
          setUser(null);
          setContainer(null);
          setContainerName(res.data.name || "");
          setScanData("");
          setIsSubmitAllowed(false);
        }
        setScanData("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleKeyPress = async (e) => {
    console.log(e.key);
    if (e.key === "Enter" || e.key == " " || e.key == "Tab") {
      inputRef.current.disabled = true;
      e.preventDefault();
      if (user == null) handleScan();
      else if (isFinalStep) {
        handleScan2();
        //updatelinecontainer();
        //setIdbin(binDispose[0].id);
        //setbinInd(binDispose[0].name);
      } else {
        handleScan1();
      }
      inputRef.current.disabled = false;
    }
  };
  useEffect(() => {
    if (showModalInfo) {
      btnRef.current.focus();
    }
  }, [showModalInfo]);
  /* const saveDataTransaksi = async () => {
        try {
            const response = await apiClient.post(`http://localhost:5000/SaveTransaksi`, {
            payload: {
               badgeId: user.badgeId,
               idContainer: container.containerId,
               IdWaste: container.IdWaste,
               bin_qr: machine.name,
               status: 'Waiting Dispose To Step 2'
            }
            });
            if (response.status != 200) {
                return;
            }
        }
        catch (error) {
        }
    };  */
  const saveDataTransaksi = async (dataContainer) => {
    try {
      let binQr = machine.name;
      if (dataContainer.IdWaste === 1) {
        const parts = binQr.split("-");
        parts.splice(2, 0, "SP");
        binQr = parts.join("-");
      } else if (dataContainer.IdWaste === 2) {
        const parts = binQr.split("-");
        parts.splice(2, 0, "SD");
        binQr = parts.join("-");
      } else if (dataContainer.IdWaste === 3) {
        const parts = binQr.split("-");
        parts.splice(2, 0, "CR");
        binQr = parts.join("-");
      } else {
      }
      try {
        const _res = await apiClient.get(
          `http://${process.env.REACT_APP_API}/CekTransaksi?idContainer=${dataContainer.containerId}&bin_qr=${binQr}&bin=${binQr}`
        );
        if (_res.status != 200) return false;
      } catch (err) {
        getTransactionList();
        toggleErrorModal({
          show: true,
          message: "Transaksi terakhir sudah ada dan belum selesai",
        });
        return false;
      }
      let response = undefined;
      try {
        response = await apiClient.post(
          `http://${process.env.REACT_APP_API}/SaveTransaksi`,
          {
            payload: {
              badgeId: user.badgeId,
              idContainer: dataContainer.containerId,
              IdWaste: dataContainer.IdWaste,
              bin_qr: binQr,
              status: "",
              idscraplog:"",
              bin: binQr,
            },
          }
        );
      } catch (err) {
        getTransactionList();
        console.log(err);
        return false;
      }
      await getTransactionList();

      if (response && response.status !== 200) {
        getTransactionList();
        console.log(response);
        return false;
      }
      return true;
    } catch (error) {
      getTransactionList();
      console.log(error);
      return false;
    }
  };

  const sendDataToStep2 = async () => {
    try {
      const response = await apiClient.post(
        `http://${container.hostname}/UpdateDataFromStep1`,
        {
          name: containerName,
          line: machine.line,
          status: "Waiting Dispose To Step 2",
        }
      );
      if (response.status != 200) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const sendDataToStep2Timbangan = async () => {
    try {
      const response = await apiClient.post(
        `http://${container.hostname}/UpdateDataFromStep1`,
        {
          name: containerName,
          line: machine.line,
          status: "Waiting Dispose To Step 2 Bin",
        }
      );
      if (response.status != 200) {
        return;
      }
    } catch (error) {}
  };

  const updatelinecontainer = async () => {
    try {
      const response = await apiClient.post(
        `http://${process.env.REACT_APP_API}/UpdateLineContainer`,
        {
          name: containerName,
          line: machine.line,
          //status: 'Waiting Dispose To Step 2',
        }
      );
      if (response.status != 200) {
        return;
      }
    } catch (error) {}
  };

  useEffect(() => {
    getTransactionList();
  }, []);

  const getTransactionList = async () => {
    const response = await apiClient.get(
      `http://${process.env.REACT_APP_API}/getTransactionList`
    );
    const transactionsWithWasteName = response.data.map((transaction) => ({
      ...transaction,
      wasteName: transaction.waste ? transaction.waste.name : "Unknown",
      //machineName: transaction.waste ? transaction.waste.name : 'Unknown',
      containerName: transaction.container
        ? transaction.container.name
        : "Unknown",
      employeeName: transaction.employee
        ? transaction.employee.username
        : "Unknown",
    }));
    setTransaction(transactionsWithWasteName);
  };

  const sendDataPanasonicServer = async (_binQr, _containerName) => {
    try {
      let stationname = _containerName.split("-").slice(0, 3).join("-");

      const response = await step1Client.post(
        `http://${apiTarget}/api/pid/step1`,
        {
          badgeno: user.badgeId,
          logindate: "",
          stationname: stationname,
          frombinname: _binQr,
          tobinname: _containerName,
          weight: "0",
          activity: "Waiting Dispose To Step 2",
        }
      );
      if (response.status != 200) {
        if (response.error || response.err) {
          toggleErrorModal({ show: true, message: "Fail saving to pidsg" });
          return null;
        }
        console.log(response);
        return null;
      }
      const result = response.data.result;
      return result;
    } catch (error) {
      return null;
    }
  };

  const handleCancelInfo = async () => {
    if (!btnInfo) return;
    setBtnInfo(false);
    //await updatelinecontainer();
    if (inputRef && inputRef.current) inputRef.current.focus();
    cancelInfo();
  };
  const cancelInfo = () => {
    setBtnInfo(true);
    setShowModalInfo(false);
    setUser(null);
    setContainer(null);
    setMachine(null);
    setbinInd(null);
    setwasteid(null);
    setScanData("");
    setFinalStep(false);
  };
  const mapRoleToLabel = (role) => {
    const roleMap = {
      admin: "Administrator",
      user: "User",
      editor: "Editor",
    };
    return roleMap[role] || role;
  };

  const renderActions = (params) => (
    <div>
      <IconButton>
        <EditIcon />
      </IconButton>

      <IconButton>
        <DeleteIcon />
      </IconButton>
    </div>
  );

  const CustomLinearProgress = ({ value }) => {
    return (
      <LinearProgress
        variant="determinate"
        value={value}
        color={value > 70 ? "error" : "primary"}
        style={{
          width: "90%",
          height: 10,
          borderRadius: 5,
          marginRight: "10px",
        }}
      />
    );
  };

  return (
    <main>
      <Disclosure as="nav" className="bg-[#093966]">
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
                    <img className="h-8 w-auto" src="/logo.jpg" alt="Logo" />
                  </div>
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                          aria-current={item.current ? "page" : undefined}
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
                        <IoSettingsOutline
                          fontSize="1.5em"
                          style={{ color: "white" }}
                        />
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
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Your Profile
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Settings
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
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
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <div className="bg-[#f4f6f9] p-5">
        <div className="grid grid-cols-3 grid-flow-col gap-5">
          <div className="row-span-2 col-span-2">
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={transaction}
                columns={[
                  { field: "id", headerName: "No", width: 100 },
                  {
                    field: "employeeName",
                    headerName: "Employee Name",
                    width: 150,
                  },
                  { field: "bin_qr", headerName: "Machine Id", width: 150 },
                  { field: "containerName", headerName: "Bin Id", width: 150 },
                  {
                    field: "wasteName",
                    headerName: "Waste",
                    width: 150,
                  },
                  {
                    field: "createdAt",
                    headerName: "DateTime",
                    width: 250,
                  },
                  {
                    field: "status",
                    headerName: "Status",
                    width: 250,
                    //renderCell: renderActions,
                  },
                ]}
                getRowId={(row) => row.uuid || row.id} // Use uuid or id as the row id
              />
            </div>
          </div>
          <div className="row-span-3">
            <div className="flex-1 p-4 border rounded bg-white h-full">
              <h1 className="text-blue-600 font-semibold text-xl mb-3">
                Scanner Result
              </h1>
              <p>Scan Please</p>
              <input
                type="text"
                autoFocus="true"
                onChange={(e) => setScanData(e.target.value)}
                value={scanData}
                name="text"
                ref={inputRef}
                onKeyDown={(e) => handleKeyPress(e)}
                className="block w-full rounded-md border-0 py-2 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder=""
              />

              <div className="text-lg mt-5">
                <p>Employee Name: {user?.username} </p>
                <p>Machine Id: {machine?.name}</p>
                <p>Bin Id: {binId}</p>
                <p>Waste: {wastedid}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-start">
        {showModalInfo && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>

              <div className="bg-white rounded p-8 max-w-md mx-auto z-50">
                <div className="text-center mb-4"></div>
                <form>
                  <Typography variant="h4" align="center" gutterBottom>
                    Data Tersimpan!
                  </Typography>
                  <div className="flex justify-center mt-5">
                    <button
                      type="button"
                      disabled={!btnInfo}
                      ref={btnRef}
                      onKeyDown={handleCancelInfo}
                      onMouseDown={handleCancelInfo}
                      className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Oke
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-start">
        {errModal.show && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>

              <div className="bg-white rounded p-8 max-w-md mx-auto z-50">
                <div className="text-center mb-4"></div>
                <form>
                  <Typography variant="h4" align="center" gutterBottom>
                    {errModal.message}
                  </Typography>
                  <div className="flex justify-center mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        toggleErrorModal((prev) => ({
                          message: "",
                          show: false,
                        }));
                        getTransactionList();
                      }}
                      className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Ok
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="flex-1 rounded border flex justify-center gap-40 p-3 bg-white">
        <p>Server Status: 192.168.1.5 Online</p>
      </footer>
    </main>
  );
};

export default Home;
