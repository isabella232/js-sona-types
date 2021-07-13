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
import { OSSIndexRequestService } from './OSSIndexRequestService';
import * as rimraf from 'rimraf';
import storage from 'node-persist';
import { join } from 'path';
import { homedir } from 'os';
import { PackageURL } from 'packageurl-js';
import axios from 'axios';
import { UserAgentHelper } from './UserAgentHelper';
import { TestLogger } from './ILogger';

const PATH = join(homedir(), '.ossindex', 'js-sona-types-test');
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OSS Index Request Service', () => {
  let service: OSSIndexRequestService;

  beforeAll(() => {
    const logger = new TestLogger();
    service = new OSSIndexRequestService(
      { browser: false, product: 'test', version: '0.0.1', logger: logger },
      storage as any,
    );
  });

  beforeEach(async () => {
    rimraf.sync(PATH);
    await storage.init({ dir: PATH, ttl: TWELVE_HOURS });
  });

  it('can handle valid request to the service, and will give valid response', async () => {
    const expectedOutput = [
      {
        coordinates: 'pkg:npm/jquery@3.1.1',
        reference: 'https://ossindex.sonatype.org/blahblahblah',
        vulnerabilities: [],
      },
    ];

    const responseObj = {
      data: expectedOutput,
      status: 200,
    };

    mockedAxios.post.mockResolvedValue(responseObj);

    const coordinates = [];
    coordinates.push(new PackageURL('npm', undefined, 'jquery', '3.1.1', undefined, undefined));

    const res = await service.getComponentDetails(coordinates);

    const userAgent = await UserAgentHelper.getUserAgent(false, 'test', '0.0.1');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `api/v3/component-report`,
      {
        coordinates: ['pkg:npm/jquery@3.1.1'],
      },
      {
        headers: [userAgent],
      },
    );

    expect(res).toBeDefined();
    expect(res.componentDetails.length).toBe(1);
    expect(res.componentDetails[0].component.name).toBe('jquery');
    expect(res.componentDetails[0].component.packageUrl).toBe('pkg:npm/jquery@3.1.1');
    expect(res.componentDetails[0].securityData.securityIssues.length).toBe(0);
    expect(res.componentDetails[0].component.componentIdentifier.format).toBe('npm');
    expect(res.componentDetails[0].matchState).toBe('PURL');
  });

  it('can handle an invalid request to the service, and to return an empty array', async () => {
    expect(await service.getComponentDetails([])).toStrictEqual({ componentDetails: [] });
  });
});
