import * as THREE from 'three';
import {Brush,Evaluator,ADDITION,INTERSECTION,SUBTRACTION} from 'three-bvh-csg';
export function booleanGeometry(a,b,operation='union'){
 const evaluator=new Evaluator();evaluator.attributes=['position','normal'];evaluator.useGroups=false;
 const ga=new THREE.BufferGeometryLoader().parse(a),gb=new THREE.BufferGeometryLoader().parse(b);ga.computeVertexNormals();gb.computeVertexNormals();
 const aa=new Brush(ga),bb=new Brush(gb);aa.updateMatrixWorld(true);bb.updateMatrixWorld(true);
 const result=evaluator.evaluate(aa,bb,{union:ADDITION,intersection:INTERSECTION,subtract:SUBTRACTION}[operation]);
 const out=result.geometry.clone();ga.dispose();gb.dispose();return out;
}
