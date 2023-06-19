import { DatePipe } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements AfterViewInit {
  params = new Map();
  dataToSign : string = '';
  constructor( private datePipe: DatePipe) {}

  ngAfterViewInit() {
    this.postToCyberSource();
  }
  // create a form for the post request
  postToCyberSource(): void {
    this.dateString();
    const form = window.document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', environment.endpoint);   
    form.setAttribute('target', 'sa_iframe');

    // Add all the data to be posted as Hidden elements    
    form.appendChild(this.createHiddenElement('access_key', environment.accessKey));
    form.appendChild(this.createHiddenElement('profile_id', environment.profileId));
    form.appendChild(this.createHiddenElement('transaction_uuid', this.uuid(16)));
    form.appendChild(this.createHiddenElement('signed_field_names', environment.signedFieldNames));
    form.appendChild(this.createHiddenElement('unsigned_field_names', environment.unsignedFieldNames));
    form.appendChild(this.createHiddenElement('signed_date_time', this.dateString()));
    form.appendChild(this.createHiddenElement('locale', 'en-US'));
    form.appendChild(this.createHiddenElement('transaction_type', environment.transactionType));
    form.appendChild(this.createHiddenElement('reference_number', '123456789'));
    form.appendChild(this.createHiddenElement('amount', '25'));    
    form.appendChild(this.createHiddenElement('currency', 'usd'));           
    form.appendChild(this.createHiddenElement('signature', this.sign()));        
    window.document.body.appendChild(form);
    form.submit();
  }
  

  // create the form
  private createHiddenElement(name: string, value: string): HTMLInputElement {
    const hiddenField = document.createElement('input');
    hiddenField.setAttribute('name', name);
    hiddenField.setAttribute('value', value);
    hiddenField.setAttribute('type', 'hidden');
    this.params.set(name, value);
    this.dataToSign += name + "=" + value + ","
    return hiddenField;
  }

  private dateString(): string {
    const activationDate = this.getNowUTC();
    return this.datePipe.transform(activationDate, 'yyyy-MM-ddTHH:mm:ss') + "Z";
  }

  private getNowUTC() {
    const now = new Date();
    return new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  }

  public sign(): string {
    this.dataToSign = this.dataToSign.substring(0, this.dataToSign.length - 1);        
    return this.signData(this.dataToSign, environment.SECRET_KEY);
  }

  public signData(data: string, secretKey: string): string {
      const signatureString = CryptoJS.HmacSHA256(data, secretKey).toString(CryptoJS.enc.Base64);      
      return signatureString;
  }

  private uuid(lengthOfCode: number) {
    const possible = "abcde1234567890";
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
      return text;
  }

}
