// exports.createSchemaCustomization = ({ actions, schema }) => {
//   const { createTypes } = actions
//   const typeDefs = [
//     `
//     interface myProject @nodeInterface {
//       id: ID!
//       folderPath: String
//       name: String
//     }

//     type dropboxFolder implements Node & myProject {
//       id: ID!
//       path: String
//       folderPath: String
//       name: String
//     }
//     `
//   ]
//   createTypes(typeDefs)
// };

// exports.onCreateNode = ({ node, actions, createNodeId, createContentDigest }) => {
//   if(node.internal.type === "dropboxFolder") {
//     console.log("exports.onCreateNode -> node", node)

//     const data = {
//       id: createNodeId(`myProject-${node.id}`),
//       parent: node.parent,
//       name: node.name,
//       folderPath: node.folderPath,
//     }
    
//     actions.createNode({
//       ...data,
//       internal: {
//         type: `myProject`,
//         contentDigest: createContentDigest(data)
//       }
//     })
//   }
// };