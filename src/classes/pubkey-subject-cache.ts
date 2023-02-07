import { BehaviorSubject } from "rxjs";

export class PubkeySubjectCache<T> {
  subjects = new Map<string, BehaviorSubject<T | null>>();
  relays = new Map<string, Set<string>>();

  hasSubject(pubkey: string) {
    return this.subjects.has(pubkey);
  }
  getSubject(pubkey: string) {
    let subject = this.subjects.get(pubkey);
    if (!subject) {
      subject = new BehaviorSubject<T | null>(null);
      this.subjects.set(pubkey, subject);
    }
    return subject;
  }
  addRelays(pubkey: string, relays: string[]) {
    const set = this.relays.get(pubkey) ?? new Set();
    for (const url of relays) set.add(url);
    this.relays.set(pubkey, set);
  }

  getAllPubkeysMissingData(include: string[] = []) {
    const pubkeys: string[] = [];
    const relays = new Set<string>();

    for (const [pubkey, subject] of this.subjects) {
      if (subject.value === null || include.includes(pubkey)) {
        pubkeys.push(pubkey);
        const r = this.relays.get(pubkey);
        if (r) {
          for (const url of r) relays.add(url);
        }
      }
    }
    return { pubkeys, relays: Array.from(relays) };
  }

  prune() {
    const prunedKeys: string[] = [];
    for (const [key, subject] of this.subjects) {
      if (!subject.observed) {
        this.subjects.delete(key);
        this.relays.delete(key);
        prunedKeys.push(key);
      }
    }
    return prunedKeys;
  }
}
