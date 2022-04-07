import React from 'react';
import Video from './Video';
import Audio from './Audio';
import ProfileImage from '../../Components/WebChat/Common/ProfileImage'
import { ReactComponent as AudioOff } from '../../assets/images/webcall/audio-mute.svg';
import { ReactComponent as VideoOff } from '../../assets/images/webcall/video-off.svg';
import Store from '../../Store';
import { pinUser } from '../../Actions/CallAction';
import { getLocalUserDetails, initialNameHandle } from '../../Helpers/Chat/User';
import { capitalizeFirstLetter } from '../../Helpers/Utility';
import {
    CALL_BUSY_STATUS_MESSAGE, CALL_ENGAGED_STATUS_MESSAGE,
    CALL_STATUS_DISCONNECTED, CALL_STATUS_ENGAGED, CALL_STATUS_HOLD,
    CALL_HOLD_STATUS_MESSAGE, CALL_STATUS_BUSY, CALL_STATUS_CONNECTED, CALL_STATUS_CALLING, CALL_STATUS_CONNECTING, CALL_STATUS_RINGING,
} from '../../Helpers/Call/Constant';
import { IconPin, IconPinActive } from '../../assets/images';

class SmallVideo extends React.Component{

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.pinUserJid !== nextProps.pinUserJid ||
            this.props.showConfrenceDataId !== nextProps.showConfrenceDataId ||
            this.props.stream.id !==  nextProps.stream.id ||
            this.props.stream.video !== nextProps.stream.video ||
            this.props.rosterData.image !== nextProps.rosterData.image ||
            nextProps.videoMuted !== this.props.videoMuted ||
            nextProps.audioMuted !== this.props.audioMuted ||
            this.props.userStatus !== nextProps.userStatus ||
            nextProps.jid !== this.props.jid){
            return true;
        }
        return false;
    }

    setPinUser = (e, userJid) => {
        e.stopPropagation();
        if(!this.props.setPinUser) return;
        Store.dispatch(pinUser(userJid));
    }

    render(){
        let { videoMuted, audioMuted, stream, rosterData, pinUserJid, userStatus, inverse } = this.props;
        let displayName = rosterData.displayName !== undefined && rosterData.displayName !== null ? rosterData.displayName : rosterData.nickname;
        let jid = (rosterData.username) ? rosterData.username : rosterData.fromUser;
        let vcardData = getLocalUserDetails();
        let muted = false;
        if(jid === vcardData.fromUser){
            muted = true;
        }
        const token = localStorage.getItem('token');
        let userStatusDisplay = "";
        if(userStatus && userStatus.toLowerCase() !== CALL_STATUS_CONNECTED){
            if(userStatus.toLowerCase() === CALL_STATUS_BUSY){
                userStatusDisplay = CALL_BUSY_STATUS_MESSAGE;
            } else if(userStatus.toLowerCase() === CALL_STATUS_ENGAGED){
                userStatusDisplay = CALL_ENGAGED_STATUS_MESSAGE;
            } else if(userStatus.toLowerCase() === CALL_STATUS_HOLD){
                userStatusDisplay = CALL_HOLD_STATUS_MESSAGE;
            } else if(userStatus.toLowerCase() === CALL_STATUS_CALLING){
                userStatusDisplay = capitalizeFirstLetter(userStatus.toLowerCase())
            } else if(userStatus.toLowerCase() === CALL_STATUS_CONNECTING){
                userStatusDisplay = capitalizeFirstLetter(userStatus.toLowerCase())
            } else if(userStatus.toLowerCase() === CALL_STATUS_RINGING){
                userStatusDisplay = capitalizeFirstLetter(userStatus.toLowerCase())
            } else if(userStatus.toLowerCase() === CALL_STATUS_DISCONNECTED){
                userStatusDisplay = capitalizeFirstLetter(userStatus.toLowerCase())
            }
        }

        let pinClass = "RemoteVideo-contianer ";
        if(this.props.setPinUser && pinUserJid === this.props.jid){
            pinClass = pinClass + "pin-user";
        }

        const getInitalName = (rosterDataVal) => {
            const localUser = rosterDataVal.fromUser === vcardData.fromUser;
            if (localUser) return vcardData.nickName;
            else return rosterDataVal.initialName;
        }
       const initialName = initialNameHandle(rosterData, getInitalName(rosterData));
        return(
            <span 
                className={`${pinClass}${userStatus && userStatus.toLowerCase() !== CALL_STATUS_CONNECTED ? " user-connecting" : ""}`} 
                onClick={(e) => this.setPinUser(e, this.props.jid)}>
                { (videoMuted || !stream.video || (this.props.callStatus && this.props.callStatus.toLowerCase() === CALL_STATUS_DISCONNECTED)) &&
                    <>
                    <ProfileImage
                        name = {initialName}
                        chatType='chat'
                        userToken={token}
                        temporary={false}
                        imageToken={rosterData.image}
                    />
                    </>
                }
                <span className="ParticipantInfo">{displayName}</span>
                {stream && stream.video && !videoMuted && this.props.callStatus &&
                    this.props.callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED && <Video stream={stream.video} muted={muted} id={stream.video.id} inverse={inverse}/>}
                {stream && stream.screenshare && this.props.callStatus &&
                    this.props.callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED && <Video stream={stream.screenshare} muted={muted} id={stream.screenshare.id} inverse={inverse} />}
                {stream && stream.audio && <Audio stream={stream.audio} muted={muted} id={stream.audio.id}/>}
                <div className="remoteCallStatus">
                    { audioMuted &&
                        <i title="Participant is muted" className="AudioOffRemote"><AudioOff/></i>
                    }
                    { videoMuted &&
                        <i title="Participant has stopped the camera" className="videoOffRemote"><VideoOff/></i>
                    }
                </div>
                {   
                        this.props.setPinUser && 
                        <>
                        {pinUserJid === this.props.jid ?
                        <i onClick={(e) => this.setPinUser(e, this.props.jid)} className="pinned active"><IconPinActive /></i>
                        :
                        <i onClick={(e) => this.setPinUser(e, this.props.jid)} className="pinned"><IconPin /></i>
                        }
                        </>
                    }
                {userStatus && userStatusDisplay !== "" && userStatus.toLowerCase() !== CALL_STATUS_CONNECTED &&
                    <div className="overlay-text">
                        {userStatusDisplay}
                    </div>
                }
            </span>
        );
    }
}

export default SmallVideo