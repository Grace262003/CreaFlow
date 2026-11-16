import { Injectable } from '@angular/core';
/** Installation du site comme application (Android : invite native de Chrome ; iPhone : consignes Safari ; sinon consignes). */
@Injectable({ providedIn: 'root' })
export class InstallService {
  evt: any = null; installed = false; help = false;
  private ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent);
  isStandalone = () => typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true);
  ios = () => /iphone|ipad|ipod/i.test(this.ua()) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
  android = () => /android/i.test(this.ua());
  inApp = () => /FBAN|FBAV|Instagram|WhatsApp|Line\/|Snapchat|TikTok|Messenger/i.test(this.ua());
  visible = () => !this.installed && !this.isStandalone() && (!!this.evt || this.ios() || this.android());
  async install() {
    if (this.evt) { this.evt.prompt(); try { await this.evt.userChoice; } catch {} this.evt = null; return; }
    this.help = true;
  }
  steps(): string[] {
    if (this.ios()) return ['Ouvrez ce site dans Safari (l’installation ne fonctionne pas dans Chrome sur iPhone).', 'Touchez le bouton Partager (le carré avec une flèche vers le haut).', 'Faites défiler et touchez « Sur l’écran d’accueil ».', 'Touchez « Ajouter » : l’icône Creaflow apparaît sur votre écran.'];
    if (this.inApp()) return ['Vous êtes dans le navigateur d’une application (WhatsApp, Facebook…).', 'Touchez le menu ⋮ ou « … » puis « Ouvrir dans le navigateur » (Chrome).', 'Dans Chrome, touchez le menu ⋮ puis « Installer l’application ».'];
    return ['Ouvrez ce site dans Chrome.', 'Touchez le menu ⋮ en haut à droite.', 'Touchez « Installer l’application » (ou « Ajouter à l’écran d’accueil »).', 'Confirmez : l’icône Creaflow apparaît sur votre écran.'];
  }
}
