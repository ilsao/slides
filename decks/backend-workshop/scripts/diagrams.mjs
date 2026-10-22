// Parse the four diagram sources into teaching data. The renderer owns geometry,
// while node names, field types, edge labels and source references come from Notion.
export function diagramFromSource(source, slideId) {
  const lines=source.code.split('\n');
  const graph={sourceId:source.id,slideId,type:source.code.startsWith('sequenceDiagram')?'sequence':source.code.startsWith('erDiagram')?'erd':'flow',nodes:[],edges:[],references:[]};
  const ref=(line,target,step)=>graph.references.push({line,target,step});
  const node=(id,label,line)=>{if(!graph.nodes.some(n=>n.id===id))graph.nodes.push({id,label:label.replaceAll('<br/>','\n'),fields:[],line});};
  let entity=null;
  for(let i=0;i<lines.length;i++){
    const text=lines[i].trim(),line=i+1;if(!text)continue;
    if(i===0){ref(line,'diagram',0);continue;}
    if(graph.type==='sequence'){
      const participant=text.match(/^participant (\w+) as (.+)$/);
      if(participant){node(participant[1],participant[2],line);ref(line,'node-'+participant[1],0);continue;}
      const edge=text.match(/^(\w+)(->>|-->>)(\w+): (.+)$/);
      if(!edge)throw new Error('Unsupported sequence source: '+text);
      const step=graph.edges.length+1;
      graph.edges.push({id:'edge-'+line,from:edge[1],to:edge[3],label:edge[4].replaceAll('<br/>','\n'),returning:edge[2]==='-->>',step,line});ref(line,'edge-'+line,step);
    }else if(graph.type==='flow'){
      for(const match of text.matchAll(/(\w+)\[(?:"([^"]+)"|\(([^)]+)\))\]/g))node(match[1],match[2]??match[3],line);
      const stripped=text.replace(/\[(?:"[^"]+"|\([^)]+\))\]/g,'');
      const match=stripped.match(/^(\w+)\s*-->\s*(?:\|([^|]+)\|\s*)?(\w+)$/);
      if(!match)throw new Error('Unsupported flow source: '+text);
      const from=graph.nodes.findIndex(n=>n.id===match[1]),to=graph.nodes.findIndex(n=>n.id===match[3]);
      const returning=to<from,step=returning?3:Math.max(0,to-1);
      graph.edges.push({id:'edge-'+line,from:match[1],to:match[3],label:match[2]??'',returning,step,line});ref(line,'edge-'+line,step);
    }else{
      const relation=text.match(/^(\w+)\s+\|\|--o\{\s+(\w+)\s*:\s*(\w+)/);
      if(relation){graph.edges.push({id:'edge-'+line,from:relation[1],to:relation[2],label:relation[3],returning:false,step:1,line});ref(line,'edge-'+line,1);continue;}
      const heading=text.match(/^(\w+)\s*\{$/);
      if(heading){entity=heading[1];node(entity,entity.toLowerCase(),line);ref(line,'node-'+entity,entity==='ENROLLMENTS'?1:0);continue;}
      if(text==='}'){ref(line,'node-'+entity,entity==='ENROLLMENTS'?1:0);continue;}
      const field=text.match(/^(\w+)\s+(\w+)(?:\s+(.*))?$/);
      if(!entity||!field)throw new Error('Unsupported ERD source: '+text);
      graph.nodes.find(n=>n.id===entity).fields.push({type:field[1],name:field[2],constraints:field[3]??'',line});ref(line,entity+'-'+field[2],entity==='ENROLLMENTS'?2:0);
    }
  }
  return graph;
}
