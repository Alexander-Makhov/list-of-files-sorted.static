import Cookies from 'universal-cookie';
import React, { useState, useEffect, useRef } from 'react';
import { doc, docx, pdf, xls, jpg, png } from "./icon";

const typeIcons = [{doc: doc}, {docx: docx}, {pdf: pdf}, {xlsx: xls}, {jpeg: jpg}, {png: png}];

const cookies = new Cookies();

const App = () => {  

    const [dataFolders, setDataFolders] = useState(null);
    const fetchDataFolders = async url => {
        const response = await fetch(url);                 
        let _temp = [];

        if (response.ok) {
            const json = await response.json();
            const data = json.data.files;
            let _tempAddIcon = [];

            Object.values(data).forEach(folder => _temp.push(...folder));

            Array.from(_temp).forEach((files, index) => {
                const keyImage = files.name.split(".")[1];
                Object.values(typeIcons).map(val => {
                    if (keyImage === Object.keys(val).shift()) {
                        files["icon"] = val[keyImage];                
                        _tempAddIcon.push(files);
                    }
                });
            });

            setDataFolders(_tempAddIcon);
            _tempAddIcon = null;
            _temp = null;
        }
        
    };
    
    const [changeName, setChangeName] = useState(null);    
    const refDataFile = React.createRef();
    const refBtnMobile = React.createRef();

    const changeFilter = event => {
        const target = event.target;
        const collectionBtn = [ ...target.parentElement.children];
        const dataName = event.target.dataset.name;

        collectionBtn.forEach(btn => btn.classList.remove("active"));
        target.classList.add("active");

        if (refDataFile.current.classList.contains("active") && refBtnMobile.current.classList.contains("active")) {
            refBtnMobile.current.classList.remove("active");
            refDataFile.current.classList.remove("active");
        }

        if (!!dataFolders) {
            let updateForlders = dataFolders.sort((a, b) => {
                if ( dataName === "name" ) {
                    if (/[А-Яа-я]/i.test(a["name"]) && /[А-Яа-я]/i.test(b["name"])) {
                        return a["name"].toLowerCase() > b["name"].toLowerCase() ? 1 : -1;
                    } else {
                        return a["name"].toLowerCase() > b["name"].toLowerCase() ? 1 : -1;
                    }
                }
                if ( dataName === "type" ) {
                    return a["type"].toLowerCase().split("/")[1] > b["type"].toLowerCase().split("/")[1] ? 1 : -1;
                }
                if ( dataName === "size" ) {
                    return b["size"] - a["size"];
                }
                if ( dataName === "atime" ) {
                    return b["atime"] > a["atime"] ? 1 : -1;
                }
                if ( dataName === "mtime" ) {
                    return b["mtime"] > a["mtime"] ? 1 : -1;
                }
            });
            
            const cookieOptions = {
                path: "/",
            }
            cookies.set("dataFolders", window.JSON.stringify(updateForlders), cookieOptions);
            cookies.set("name", window.JSON.stringify(dataName), cookieOptions);
            
            if (!!cookies.get("dataFolders")) {
                return setDataFolders(cookies.get("dataFolders"));
            } else {
                return setDataFolders( updateForlders );
            }
        }
    }        

    const [isActive, setActive] = useState("false");
    const handleToggle = () => setActive(!isActive);

    useEffect(() => {
        fetchDataFolders("https://prof.world/api/test_json_files/?token=6a06cc0050374e32be51125978904bd8");
    }, []);

    return (
        <div className={isActive ? "data-files" : "data-files active"} ref={refDataFile}>
            <div className="heading-filter">
                <div className="heading-filter-mobile">
                    <span className="filter-title">Filter list</span>
                    <button className={isActive ? "btn-menu" : "btn-menu active"} onClick={handleToggle} ref={refBtnMobile}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
                <div className="btn-group">
                    {(() => {
                        if (!!dataFolders) {
                            return dataFolders.map((files, index) => {
                                const dataName = Object.keys(files)[index];
                                if (dataName !== "dev" && dataName !== "icon" && dataName !== undefined) {    
                                    let activeClass = cookies.get("name") === dataName ? " active" : "";
                                    if (dataName === "atime") {
                                        return (
                                            <button 
                                            key={index} 
                                            className={`btn-filter` + activeClass}
                                            data-name={dataName}
                                            onClick={changeFilter}
                                            >
                                                Access
                                                <span className="check"></span>
                                            </button>
                                        )
                                    } else if (dataName === "mtime") {
                                        return (
                                            <button 
                                            key={index} 
                                            className={`btn-filter` + activeClass}
                                            data-name={dataName}
                                            onClick={changeFilter}
                                            >
                                                Modified
                                                <span className="check"></span>
                                            </button>
                                        )
                                    } else {
                                        return (
                                            <button 
                                            key={index} 
                                            className={`btn-filter` + activeClass}
                                            data-name={dataName}
                                            onClick={changeFilter}
                                            >
                                                {dataName[0].toUpperCase() + dataName.substring(1)}
                                                <span className="check"></span>
                                            </button>
                                        )
                                    }                            
                                };
                            });
                        }
                    })()}
                </div>
            </div>
            <div className="file-manager">
                {(() => {
                    if (!!cookies.get("dataFolders")) {
                        return cookies.get("dataFolders").map((files, index) => {                                
                            const name = files["name"].toLowerCase().split(".")[0];
                            const currentMimeType = files["name"].toLowerCase().split(".")[1];
                            const aDate = new Date(files["atime"]).toISOString().split('T')[0];
                            const aTime = new Date(files["atime"]).toISOString().split('T')[1].split(".")[0];
                            const mDate = new Date(files["mtime"]).toISOString().split('T')[0];
                            const mTime = new Date(files["mtime"]).toISOString().split('T')[1].split(".")[0];
                            return (
                                <div
                                    key={index} 
                                    className="file-item"
                                    data-dev={files["dev"]}
                                    data-name={files["name"]}
                                    data-type={files["type"]}
                                    data-size={files["size"]}
                                    data-mtime={files["mtime"]}
                                    data-atime={files["atime"]}
                                >
                                    <div className="item icon">
                                        {(() => {
                                            const url = files["icon"].split(".png")[0];
                                            const mime_type = files["icon"].split(/[.$]/)[files["icon"].split(/[.$]/).length-1].split("?")[0];
                                            if (process.env.NODE_ENV === "development") {
                                                return (
                                                    <figure>
                                                        <img src={files["icon"]} alt={currentMimeType} />
                                                    </figure>
                                                )
                                            } else {
                                                return (
                                                    <picture>
                                                        <source srcset={url + ".webp"} type="image/webp" />
                                                        <source srcset={files["icon"]} type={"image/" + mime_type} />
                                                        <img src={files["icon"]} alt={currentMimeType} />
                                                    </picture>
                                                )
                                            }
                                        })()}
                                    </div>
                                    <div className="item">{name[0].toUpperCase() + name.substring(1)}</div>
                                    <div className="item">{files["type"]}</div>
                                    <div className="item">{files["size"]}</div>
                                    <div className="item">{aDate} {aTime}</div>
                                    <div className="item">{mDate} {mTime}</div>
                                </div>
                            )
                        });
                    } else if (!!dataFolders) {
                        return dataFolders.map((files, index) => {                                
                            const name = files["name"].toLowerCase().split(".")[0];
                            const currentMimeType = files["name"].toLowerCase().split(".")[1];
                            const aDate = new Date(files["atime"]).toISOString().split('T')[0];
                            const aTime = new Date(files["atime"]).toISOString().split('T')[1].split(".")[0];
                            const mDate = new Date(files["mtime"]).toISOString().split('T')[0];
                            const mTime = new Date(files["mtime"]).toISOString().split('T')[1].split(".")[0];
                            return (
                                <div
                                    key={index} 
                                    className="file-item"
                                    data-dev={files["dev"]}
                                    data-name={files["name"]}
                                    data-type={files["type"]}
                                    data-size={files["size"]}
                                    data-mtime={files["mtime"]}
                                    data-atime={files["atime"]}
                                >
                                    <div className="item icon">
                                        {(() => {
                                            const url = files["icon"].split(".png")[0];
                                            const mime_type = files["icon"].split(/[.$]/)[files["icon"].split(/[.$]/).length-1].split("?")[0];
                                            if (process.env.NODE_ENV === "development") {
                                                return (
                                                    <figure>
                                                        <img src={files["icon"]} alt={currentMimeType} />
                                                    </figure>
                                                )
                                            } else {
                                                return (
                                                    <picture>
                                                        <source srcset={url + ".webp"} type="image/webp" />
                                                        <source srcset={files["icon"]} type={"image/" + mime_type} />
                                                        <img src={files["icon"]} alt={currentMimeType} />
                                                    </picture>
                                                )
                                            }
                                        })()}
                                    </div>
                                    <div className="item">{name[0].toUpperCase() + name.substring(1)}</div>
                                    <div className="item">{files["type"]}</div>
                                    <div className="item">{files["size"]}</div>
                                    <div className="item">{aDate} {aTime}</div>
                                    <div className="item">{mDate} {mTime}</div>
                                </div>
                            )
                        });
                    }
                })()}
            </div>
        </div>
    )
}

export default App;