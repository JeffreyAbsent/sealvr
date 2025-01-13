import { Dispatch, SetStateAction, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import ThumbnailContainer from "./thumbnailContainer";
import TextContainer from "./textContainer";
import { PinpointType, ViewListType, VrProjectType } from "@/types/vrProjectType";
import * as THREE from 'three';
import _ from "lodash";
import { Interactive } from "@react-three/xr";
import { VrViewerContext } from "../../../..";
import useAnimation from "@/hooks/animation";
import { VrViewerDepthContext } from "../../..";

type ViewPinpointContextType = {
    pinpoint:PinpointType,
    xDistance:number,
    yDistance:number,
    size:number,
    textRef:any,
    isTextRendered:boolean, 
    setIsTextRendered:Dispatch<SetStateAction<boolean>>,
    textSize:number,
    textOpacity:number, 
    setTextOpacity:Dispatch<SetStateAction<number>>
}
export const ViewPinpointContext = createContext<ViewPinpointContextType>({} as ViewPinpointContextType)

const ViewPinpoint = ({pinpoint, index}:{pinpoint:PinpointType, index:number}) => {
    const {
        currentView, 
        xrTeleport, 
        setGazedPinId, 
        gazedPinId, 
        selectedScene
    } = useContext(VrViewerDepthContext)    
    const {selectedProject} = useContext(VrViewerContext)

    const viewPos = new THREE.Vector3(currentView.position.x, currentView.position.y, currentView.position.z)
    const pinpointNormal = new THREE.Vector3(pinpoint.position.x, pinpoint.position.y, pinpoint.position.z).sub(new THREE.Vector3().copy(viewPos)).normalize()
    const pinpointPosition = new THREE.Vector3(currentView.position.x, currentView.position.y, currentView.position.z).add(pinpointNormal)
    const size = 0.05
    
    // Text related
    const [isTextRendered, setIsTextRendered] = useState(false)
    const textRef = useRef(null as any)
    const [bbox, setBbox] = useState({
        max:{
            x:0,
            y:0
        },
        min:{
            x:0,
            y:0
        },
    })
        
    const [xDistance, setXDistance] = useState(0)
    const [yDistance, setYDistance] = useState(0)

    const textSize = 0.00001
    const [textOpacity, setTextOpacity] = useState(0)

    useEffect(()=>{
        setTimeout(()=>{
            if(textRef.current){
                textRef.current.geometry.computeBoundingBox()
                const bbox = textRef.current.geometry.boundingBox
                setBbox(bbox)
                setXDistance(Math.abs(bbox.max.x - bbox.min.x) * textSize)
                setYDistance(Math.abs(bbox.max.y - bbox.min.y) * textSize)
                setTextOpacity(1)
            }
        },100)
    },[textRef.current])

    useEffect(()=>{
        setXDistance(Math.abs(bbox.max.x - bbox.min.x) * textSize)
        setYDistance(Math.abs(bbox.max.y - bbox.min.y) * textSize)
    },[bbox])

    const groupRef = useRef(null as any)
    const {animate} = useAnimation()

    // Everytime gazed pin id change, play animation
    useEffect(()=>{
        const duration = 0.1
        if(pinpoint._id === gazedPinId){
            if(groupRef.current){
                const scale = 1.1
                animate(groupRef.current.scale,{
                    x:scale,
                    y:scale,
                    z:scale,
                    duration:duration,
                    ease:`power3.out`
                })
            }
        }
        else{
            if(groupRef.current){
                const scale = 1
                animate(groupRef.current.scale,{
                    x:scale,
                    y:scale,
                    z:scale,
                    duration:duration,
                    ease:`power3.out`
                })
            }
        }
    },[gazedPinId])
    return (  
        <ViewPinpointContext.Provider
            value={{
                size,
                pinpoint,
                xDistance,
                yDistance,
                textRef,
                isTextRendered, 
                setIsTextRendered,
                textSize,
                textOpacity, setTextOpacity
            }}
        >
            <Interactive
                onHover={()=>{
                    setGazedPinId(pinpoint._id)
                }}
                onBlur={()=>{
                    setGazedPinId("")
                }}
                onMove={()=>{
                    setGazedPinId(pinpoint._id)
                }}
                onSelect={()=>{
                    const findView = selectedScene.viewList.find(view=>{return view.viewName === pinpoint.toViewName})
                    if(findView){
                        xrTeleport(findView)
                    }
                }}
            >                    
                {/* Mesh Group */}
                <group
                    ref={groupRef}
                    position={[
                        pinpointPosition.x,
                        pinpointPosition.y,
                        pinpointPosition.z
                    ]}
                    onUpdate={(self:any) =>{
                        self.lookAt(new THREE.Vector3(currentView.position.x,pinpoint.position.y,currentView.position.z))
                    }}
                    onPointerUp={async ()=>{
                        const findView = selectedScene.viewList.find(view=>{return view.viewName === pinpoint.toViewName})
                        if(findView){
                            xrTeleport(findView)
                        }
                    }}
                    onPointerEnter={()=>{
                        console.log('asd')
                        setGazedPinId(pinpoint._id)
                    }}
                    onPointerLeave={()=>{
                        setGazedPinId("")
                    }}
                >
                    <ThumbnailContainer/>
                    <TextContainer/>
                </group>
            </Interactive>
        </ViewPinpointContext.Provider>
    );
}
 
export default ViewPinpoint;