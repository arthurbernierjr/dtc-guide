import React from 'react';
import {Frame} from './components/Frame';
import {F, T, Layout} from './tokens';

type Props = {layout: Layout; session: string; title: string; mode: string; nodes: string[][]; artifact: string};
export const CurriculumDiagram: React.FC<Props> = ({layout, session, title, mode, nodes, artifact}) => {
  const tall = layout === 'tall';
  const color = mode === 'diagnosis' ? T.red : mode === 'evidence' ? T.yellow : T.greenLight;
  return <Frame layout={layout} title={`${session} / ${title}`} caption={`THE PATH · SESSION ${session}`}>
    <div style={{height:'100%',display:'flex',flexDirection:'column',gap:tall?28:36}}>
      <div style={{fontFamily:F.display,fontSize:tall?38:45,lineHeight:1.18,maxWidth:1350}}>{artifact}</div>
      <div style={{display:'flex',flexDirection:tall||mode==='diagnosis'?'column':'row',gap:tall?22:24,flex:1,alignItems:'stretch',justifyContent:'center'}}>
        {nodes.map(([label,description],i)=><React.Fragment key={label}>
          {i>0&&mode==='flow'&&!tall?<div style={{alignSelf:'center',fontSize:38,color}}>→</div>:null}
          <div style={{flex:1,background:T.card,border:`2px solid ${color}66`,borderRadius:18,padding:tall?26:30,display:'flex',flexDirection:mode==='diagnosis'&&!tall?'row':'column',gap:mode==='diagnosis'&&!tall?30:18,alignItems:mode==='diagnosis'&&!tall?'center':'stretch'}}>
            <div style={{fontFamily:F.mono,color,fontSize:tall?22:24,flexShrink:0}}>{mode==='diagnosis'?'CHECK':mode==='evidence'?'PROOF':'STEP'} {String(i+1).padStart(2,'0')}</div>
            <div style={{fontFamily:F.display,fontSize:tall?32:34,lineHeight:1.14,flex:mode==='diagnosis'&&!tall?'0 0 440px':undefined}}>{label}</div>
            <div style={{fontSize:tall?25:28,lineHeight:1.4,color:T.soft}}>{description}</div>
          </div>
        </React.Fragment>)}
      </div>
      <div style={{borderTop:`1px solid ${T.border2}`,paddingTop:20,fontFamily:F.mono,fontSize:tall?20:23,color:T.muted,lineHeight:1.4}}>{mode==='flow'?'Trace each boundary. Name the input, decision, and result.':mode==='diagnosis'?'Observe the symptom → isolate the boundary → verify the correction.':'Keep expected behavior, observed evidence, and remaining limits together.'}</div>
    </div>
  </Frame>;
};
