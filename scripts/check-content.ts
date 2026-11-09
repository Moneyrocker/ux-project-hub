import {loadHub} from '../src/lib/content';
const d=loadHub();if(d.projects.length===0)throw new Error('No projects');for(const item of [...d.sources,...d.documents])if(item.sensitivity!=='public')throw new Error('Non-public content');console.log(`${d.projects.length} projects, ${d.documents.length} documents, ${d.sources.length} public sources`);
