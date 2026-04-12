// Simple client-side blockchain simulation

export interface CertificateData {
  studentName: string;
  certificateTitle: string;
  organisationName: string;
  courseName: string;
  institution: string;
  dateIssued: string;
  certificateId: string;
}

export interface Block {
  index: number;
  timestamp: string;
  data: CertificateData;
  hash: string;
  previousHash: string;
}

async function computeHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function createBlock(
  index: number,
  data: CertificateData,
  previousHash: string
): Promise<Block> {
  const timestamp = new Date().toISOString();
  const blockContent = `${index}${timestamp}${JSON.stringify(data)}${previousHash}`;
  const hash = await computeHash(blockContent);
  return { index, timestamp, data, hash, previousHash };
}

const STORAGE_KEY = "certilink_blockchain";

function getChain(): Block[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveChain(chain: Block[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chain));
}

export async function addCertificate(data: CertificateData): Promise<Block> {
  const chain = getChain();
  const previousHash = chain.length > 0 ? chain[chain.length - 1].hash : "0";
  const block = await createBlock(chain.length, data, previousHash);
  chain.push(block);
  saveChain(chain);
  return block;
}

export function getAllCertificates(): Block[] {
  return getChain();
}

export function verifyCertificate(certificateId: string): Block | null {
  const chain = getChain();
  return chain.find((block) => block.data.certificateId === certificateId) || null;
}

export async function verifyChainIntegrity(): Promise<boolean> {
  const chain = getChain();
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].previousHash !== chain[i - 1].hash) {
      return false;
    }
  }
  return true;
}

export function generateCertificateId(): string {
  return `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
