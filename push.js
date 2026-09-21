const fs = require('fs');
const path = require('path');

const token = process.env.GITHUB_TOKEN;
const owner = "ecasasolacr";
const repo = "FamilyHub";
const branch = "main";

async function request(method, endpoint, body) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return res.json();
}

async function run() {
  console.log("Getting latest commit...");
  const ref = await request('GET', `/repos/${owner}/${repo}/git/refs/heads/${branch}`);
  const latestCommitSha = ref.object.sha;
  
  const commit = await request('GET', `/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);
  const baseTreeSha = commit.tree.sha;

  console.log("Reading local files...");
  function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!['node_modules', '.next', '.git'].includes(file)) {
          getFiles(fullPath, fileList);
        }
      } else {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }
  
  const allFiles = getFiles('.');
  const treeItems = [];

  console.log(`Uploading ${allFiles.length} blobs...`);
  let count = 0;
  for (const filePath of allFiles) {
    // Normalize path for github
    const gitPath = filePath.replace(/\\/g, '/');
    const content = fs.readFileSync(filePath);
    
    // Create blob
    const blob = await request('POST', `/repos/${owner}/${repo}/git/blobs`, {
      content: content.toString('base64'),
      encoding: 'base64'
    });
    
    treeItems.push({
      path: gitPath,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    });
    
    count++;
    if (count % 10 === 0) console.log(`Uploaded ${count} blobs`);
  }

  console.log("Creating tree...");
  const newTree = await request('POST', `/repos/${owner}/${repo}/git/trees`, {
    base_tree: baseTreeSha,
    tree: treeItems
  });

  console.log("Creating commit...");
  const newCommit = await request('POST', `/repos/${owner}/${repo}/git/commits`, {
    message: "Push full project via API",
    tree: newTree.sha,
    parents: [latestCommitSha]
  });

  console.log("Updating ref...");
  await request('PATCH', `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    sha: newCommit.sha,
    force: true
  });

  console.log("Push completed successfully!");
}

run().catch(console.error);
