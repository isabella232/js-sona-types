/*
 * Copyright 2021-Present Sonatype Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Agent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

export class RequestHelpers {
  public static getAgent(insecure = false): Agent | undefined {
    if (insecure) {
      return new HttpsAgent({
        rejectUnauthorized: false,
      });
    }

    return this.getHttpAgent();
  }

  public static getHttpAgent(): Agent | undefined {
    const proxyUrl = process.env.http_proxy || process.env.https_proxy;
    if (proxyUrl !== undefined && proxyUrl !== 'no-proxy') {
      return new HttpsProxyAgent(proxyUrl);
    }
    return undefined;
  }
}
