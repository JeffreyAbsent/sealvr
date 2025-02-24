import { PinpointType, viewListObject } from "@/types/vrProjectType";
import { createContext, useContext, useEffect, useState, useRef, Dispatch, SetStateAction } from 'react';
import * as THREE from 'three'
import Pinpoint from "./pinpoint";
import { PinpointsUiContext } from "..";
import { VrViewerContext } from "@/components/vrViewer";
import { VrViewerStaticContext } from "../../..";

type ViewPinpointContainerContextType = {
    pin:PinpointType,
    pinpointRef:any,
    opacity:number,
    setOpacity:Dispatch<SetStateAction<number>>
}
export const ViewPinpointContainerContext = createContext<ViewPinpointContainerContextType>({} as ViewPinpointContainerContextType)
const ViewPinpointContainer = ({pin}:{pin:PinpointType}) => {
    const {isEditorMode,setEnableOrbitControl, 
        currentView, camera, mainMeshRef, 
        draggedView, setCurrentView,
        setDraggedView,
        cameraRig, selectedScene,
    } = useContext(VrViewerStaticContext)

    const {isMouseDown, setIsMouseDown, isDragged, setIsDragged} = useContext(PinpointsUiContext)
    const {setSelectedProject,selectedProject} = useContext(VrViewerContext)
    const [opacity,setOpacity] = useState(0)
    const pinpointRef = useRef<HTMLDivElement>(null)

    // Render pinpoint to 3D view
    useEffect(()=>{
        let animationFrameId:any

        const render = () => {
            if(camera.fov > 0){
                // Rotated value
                const quaternion = new THREE.Quaternion()
                const radians = currentView.rotation * (Math.PI/180)
                quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), radians)
                // 
                const currentPosition = new THREE.Vector3(pin.position.x, pin.position.y, pin.position.z)
                
                // Get dot product
                const cameraToPoint = new THREE.Vector3().subVectors(cameraRig.position,currentPosition).normalize()
                
                const rotatedCameraToPoint = cameraToPoint.applyQuaternion(quaternion)
                const cameraDir = camera.getWorldDirection(new THREE.Vector3())

                const dotProduct = cameraDir.dot(rotatedCameraToPoint)

                // Translate UI according to 2D space
                const screenPosition = currentPosition.clone()
                const rotatedScreenPosition = screenPosition.applyQuaternion(quaternion)
                rotatedScreenPosition.project(camera as any)
                const translateX =  dotProduct > 0? 999999 : (rotatedScreenPosition.x * innerWidth * 0.5) 
                const translateY =  dotProduct > 0? 999999 : (-rotatedScreenPosition.y * innerHeight * 0.5)
                if(pinpointRef.current){
                    pinpointRef.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
                }
            }
 
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    },)
    return (  
        <ViewPinpointContainerContext.Provider
            value={{
                pin,
                pinpointRef,
                opacity,setOpacity
            }}
        >
            <div
                className='text-white no-select'
                ref={pinpointRef}
                style={{
                    opacity:currentView._id === pin.toViewId? `0%` : `100%`,
                    zIndex:`1`,
                    position:`absolute`,
                    cursor:`pointer`,
                    left:`50%`,
                    top:`50%`,
                    display:`flex`,
                    justifyContent:`center`,
                    alignItems:`center`,
                    flexWrap:`wrap`,
                }}
                onMouseDown={()=>{
                    if(isEditorMode){
                        setEnableOrbitControl(false)
                        setIsMouseDown(true)
                    }
                }}
                onMouseUp={()=>{
                    if(isEditorMode){
                        setIsMouseDown(false)
                        // Set pinpoint thumbnail
                        if(draggedView._id !== ''){
                            // Current View
                            currentView.pinpoints = currentView.pinpoints.map((p)=>{
                                if(p._id === pin._id){
                                    return {...p,
                                        labelName:draggedView.labelName,
                                        thumbnailUrl:draggedView.thumbnailUrl,
                                        toViewId:draggedView._id,
                                    }
                                }
                                else{
                                    return p
                                }
                            })

                            // SelectedScene
                            selectedScene.viewList = selectedScene.viewList.map(view=>{
                                return {...view,
                                    pinpoints: view.pinpoints.map((p)=>{
                                        if(p._id === pin._id){
                                            return {...p,
                                                labelName:draggedView.labelName,
                                                thumbnailUrl:draggedView.thumbnailUrl,
                                                toViewId:draggedView._id,
                                            }
                                        }
                                        else{
                                            return p
                                        }
                                    })
                                }
                            })

                            // Selected Project
                            selectedProject.scenes = selectedProject.scenes.map(scene=>{
                                return {...scene,
                                    viewList:scene.viewList.map(view=>{
                                        return {...view,
                                            pinpoints: view.pinpoints.map((p)=>{
                                                if(p._id === pin._id){
                                                    return {...p,
                                                        labelName:draggedView.labelName,
                                                        thumbnailUrl:draggedView.thumbnailUrl,
                                                        toViewId:draggedView._id,
                                                    }
                                                }
                                                else{
                                                    return p
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                            setSelectedProject(prev=>{return {...prev}})
                            
                            // Last, dragged view go back to normal
                            setDraggedView(viewListObject)
                        }
                    }
                }}
                
                onMouseEnter={()=>{
                    if(selectedProject.globalSettings.showLabel.viewportPinpoint === 'hover'){
                        setOpacity(100)
                    }
                }}
                onMouseLeave={()=>{
                    if(selectedProject.globalSettings.showLabel.viewportPinpoint === 'hover'){
                        setOpacity(0)
                    }
                }}
            >  
                <Pinpoint/>
            </div>
        </ViewPinpointContainerContext.Provider>
    );
}
 
export default ViewPinpointContainer;