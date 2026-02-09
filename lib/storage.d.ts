/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="../eve-oauth2-cli.d.ts"/>
/**
 * @file src/lib/storage.d.ts
 * @command node src/lib/storage.d.ts
 */
declare interface IJsonStorage<
  T extends Record<string, any> = Record<string, any>,
> extends IStorage<T> {
  /**
   * The data source
   */
  src: T;
  /**
   * Load the data source
   * @param arg - An optional argument for loading
   * @returns A promise that resolves to the storage instance
   */
  load<ArgType extends unknown = string>(arg?: ArgType): Promise<this>;
}
declare interface IStorage<T> {
  /**
   * Set the entire data source
   * @param source - The data source to set
   */
  setData(source: T): void;
  /**
   * Set a specific field in the data source
   * @param fieldName - The name of the field to set
   * @param data - The data to set in the field
   * @date 2025/2/18 22:30:00
   */
  set(fieldName: keyof T, data: T[typeof fieldName]): void;
  /**
   * Get the entire data source
   * @returns The data source
   */
  getData(): T;
  /**
   * Get a specific field from the data source
   * @param fieldName - The name of the field to get
   * @returns The data in the specified field
   * @date 2025/2/18 22:30:00
   */
  get(fieldName: keyof T): T[typeof fieldName];
  /**
   * Get data by a specific path
   * ```
   * // e.g
   * "app credential name/characters"
   * "app credential name/clientId"
   * ```
   * @template U
   * @param path - The path to the data
   * @returns The data at the specified path
   */
  getByPath<U>(path: string): U;
  /**
   * Save the data source
   * @returns A promise that resolves when the data is saved
   */
  save(): Promise<void>;
}
declare type TEVEOAuthRecord = {
  [characterId: string]: NsEVEOAuth.TEVEOAuthCodeExchangeResult;
};
declare type TEVEOAuth2GlobalEntry = NsEVEOAuth.TEVEAppCredentials & {
  characters: TEVEOAuthRecord;
};
declare type TEVEOAuth2GlobalStrage = {
  [appCredentialNickName: string]: TEVEOAuth2GlobalEntry;
};
