import uuidv4 from 'uuid/v4';
import { REACT_APP_API_URL } from '../Components/processENV';
import SDK from '../Components/SDK';
import { decryption, encryption } from '../Components/WebChat/WebChatEncryptDecrypt';
import { formatUserIdToJid } from '../Helpers/Chat/User';
import { compare, parsedContacts } from '../Helpers/Utility';
import { ROSTER_DATA, ROSTER_DATA_ADD } from './Constants';

window.decryption = decryption;
const mapColorForTouser =  () => '#'+Math.floor(Math.random()*16777215).toString(16);

const createUserMessageColor = ( data = []) =>{
    return data.map(contact=>{
        return { 
            ...contact,
            userColor:mapColorForTouser()
        }
    })
}

export const RosterData = (data) => {
    return (dispatch, getState) => {
        const getcurrentState = getState()
        const promise = new Promise((resolve,reject) =>{
            dispatch({
                type: ROSTER_DATA,
                payload: {
                    id: uuidv4(),
                    data:createUserMessageColor(data)
                }
            });
           resolve(true) 
        })
        const rosterId = getcurrentState?.rosterData?.id
        if(rosterId) return
        promise.then(async (res)=> {
            // const userIBlockedRes = await SDK.getUsersIBlocked();
            // console.log('userIBlockedRes -- ', userIBlockedRes);
            // if(userIBlockedRes && userIBlockedRes.statusCode === 200){
            //     const jidArr = formatToArrayofJid(userIBlockedRes.data);
            //     Store.dispatch(blockedContactAction(jidArr));
            // }
            // const userBlockedMeRes = await SDK.getUsersWhoBlockedMe();
            // console.log('userBlockedMeRes -- ', userBlockedMeRes);
            // if(userBlockedMeRes && userBlockedMeRes.statusCode === 200){
            //     const jidArr = formatToArrayofJid(userBlockedMeRes.data);
            //     setContactWhoBleckedMe(jidArr);
            // }
        });
    };
    
}

function settings(){
    let token = localStorage.getItem('token');
    let decryptResponse = decryption('auth_user');
    fetch(`${REACT_APP_API_URL}/users/config`,{
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    }).then(response => response.json()).then(res=>{
       const {data} = res
       return SDK.getSettings(data, decryptResponse.username+decryptResponse.username+decryptResponse.username)
    }).then(response=>{
        localStorage.setItem('settings',response)
    })
}

const fetchMailContacts = async(token, data, dispatch) => {
    await fetch(`${REACT_APP_API_URL}/contacts/mail/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({
            "syncTime": ""
        })
    }).then(response => response.json())
        .then(async (res) => {
            const isMailContactNeeded = false;
            if (res.status === 200 && isMailContactNeeded) {
                let mailContacts = res.data.created;
                // TODO - Need to Change these Params in API 
                mailContacts = mailContacts.map(contact => { 
                    const status = contact.statusMsg,
                        userId = contact.username,
                        userJid = formatUserIdToJid(contact.username);
                    delete contact.status;
                    
                    return {
                        ...contact, 
                        isFriend: true,
                        userId,
                        userJid,
                        status,
                    }
                })
                let concateData = [ ...data, ...mailContacts];
                let parsedData = await parsedContacts(concateData);
                let contacts = await parsedData.sort(compare);
                encryption("roster_data", contacts);
                dispatch(RosterData(contacts));
            } else if (res.status === 401) {
                let decryptResponse = decryption("auth_user");
                const tokenResult = await SDK.getUserToken(decryptResponse.username, decryptResponse.password);
                if (tokenResult.statusCode === 200) {
                    localStorage.setItem("token", tokenResult.userToken);
                    fetchMailContacts(tokenResult.userToken, data, dispatch);
                }
            } else {
                let contacts = await data.sort(compare);
                encryption("roster_data", contacts);
                dispatch(RosterData(contacts));
            }
        }).catch((error) => {
            let contacts = data.sort(compare);
            encryption("roster_data", contacts);
            dispatch(RosterData(contacts));
            console.log("error message for email contact sync: ", error);
        });
}

export const RosterDataAction = (data) => async dispatch => {
    let token = localStorage.getItem('token');
    if (token !== null) {
        // Change it to SDK 
        fetchMailContacts(token, data, dispatch);
    }
}

/**
 * Add new data into roster
 * @param {*} userObj 
 */
export const addNewRosterAction = (userObj) => {
    return {
        type: ROSTER_DATA_ADD,
        payload: {
            id: uuidv4(),
            data:userObj
        }
    }
}