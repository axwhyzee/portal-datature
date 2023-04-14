import React, { useState, useEffect } from "react";
import { AreaChart, XAxis, YAxis, Tooltip, Area, Legend } from 'recharts';
import classes from "./timeline.module.css";
import { TagColours } from "@portal/constants/annotation";

function Timeline({annotations, confidence, videoSeekCallback}) {
    const [frames, setFrames] = useState([]);
    const [objects, setObjects] = useState([]);
    const [width, setWidth] = useState();

    console.log('Render <Timeline>');

    useEffect(() => {
        aggregateAnnots();
    }, [annotations, confidence]); 

    const aggregateAnnots = () => {
        const tempFrames = [];
        const tempObjs = new Set();
        let tagName;
        let frame;

        for (const [key, value] of Object.entries(annotations)) {
            frame = {'time': key / 1000};
            value.forEach(annot => {
                if (annot.confidence >= confidence) {
                    tagName = annot.tag.name;
                    if (tagName in frame) {
                        frame[tagName]++;
                    } else {
                        frame[tagName] = 1;
                    }

                    // store all unique tags
                    tempObjs.add(tagName);
                }
            });
            tempFrames.push(frame);
        };
        setFrames(tempFrames);
        setObjects(Array.from(tempObjs));
    }

    return (
        <AreaChart 
            className={classes.Timeline}
            width={window.innerWidth}
            height={220}
            data={frames}
            margin={{bottom: 10, left: -40}}
            onClick={(data)=>videoSeekCallback(data.activeLabel)}
        >
            <defs>
            {
                objects.map((objectName, index) => {
                    return (
                        <linearGradient id={index} x1="0" y1="0" x2="0" y2="1" key={index}>
                            <stop offset="5%" stopColor={TagColours[index+1]} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={TagColours[index+1]} stopOpacity={0} />
                        </linearGradient>
                    );
                })
            }
            </defs>
            <XAxis dataKey="time" />
            <YAxis />   
            <Tooltip />
            <Legend height={2} />
            {
                objects.map((objectName, index) => {
                    return (
                        <Area
                            key={index}
                            type="monotone"
                            dataKey={objectName}
                            stroke="#000"
                            fillOpacity={1}
                            fill={"url(#" + index + ")"}
                            stackId={1}
                        />
                    );
                })
            }
        </AreaChart>
    )
}


// prevent Timeline component from re-rendering unless props changed
export default React.memo(Timeline);