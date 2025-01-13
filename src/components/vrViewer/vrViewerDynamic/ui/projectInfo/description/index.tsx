import { useContext, useState, useRef} from "react";

import Button from "@/components/common/button";
import { VrViewerDynamicContext } from '@/components/homepage/bodyContainer/vrViewer/vrViewerDynamic';

const Description = () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const {showInfo, selectedProject, setSelectedProject, isEditorMode, isDev} = useContext(VrViewerDynamicContext)
    const [isDoubleClick, setIsDoubleClick] = useState(false)
    return (  
        <>
            {!isDoubleClick?
                <div
                    style={{
                        cursor:`text`,
                        pointerEvents:showInfo?`all`:`none`,
                        height:`auto`,
                        boxSizing:`border-box`,
                        fontSize:`1.5rem`,
                        fontWeight:`400`
                    }}
                    onDoubleClick={()=>{
                        console.log(isDev)
                        if(isDev){
                            setIsDoubleClick(true)
                            if(textareaRef.current){
                                textareaRef.current.value = selectedProject.info.text
                                setSelectedProject(prev=>{return {...prev}})
                            }
                        }
                    }}
                >
                    {selectedProject.info.text === '' && isEditorMode?
                        <div>
                            Double click to give an description.
                        </div>
                    :null}
                    {selectedProject.info.text.split('\n').map((line,index)=>
                        <div
                            key={index}
                        >
                            {line}&nbsp;
                        </div>    
                    )}
                </div>
            :null}
            <div
                style={{
                    pointerEvents:showInfo?`all`:`none`,
                    width:isDoubleClick?`100%`:`0%`,
                    height:isDoubleClick?``:`0%`,
                    opacity:isDoubleClick?`100%`:`0%`,
                }}
            >
                <textarea 
                    ref={textareaRef}
                    className='text-white'
                    name="paragraph_text" 
                    cols={150} 
                    rows={30}
                    style={{
                        background:`none`,
                        fontSize:`1.5rem`,
                        fontWeight:`400`
                    }}
                />
                <div
                    style={{
                        display:`flex`
                    }}
                >
                    <Button
                        label='Submit text'
                        onClick={()=>{
                            if(textareaRef.current){
                                selectedProject.info.text = textareaRef.current.value
                                setSelectedProject(prev=>{return {...prev}})
                            }
                            setIsDoubleClick(false)
                        }}
                    />
                </div>
            </div>
        </>
    );
}
 
export default Description;