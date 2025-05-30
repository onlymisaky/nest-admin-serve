import { Buffer } from 'node:buffer';
import { createEnumDescription } from '@shared/utils/enum';
import { Column, Entity } from 'typeorm';
import { BaseEntityWithId } from './base.entity';

export enum TinyintEnum {
  OPTION1 = 1,
  OPTION2 = 2,
  OPTION3 = 3,
  OPTION4 = 4,
  OPTION5 = 5,
}

export const TINYINT_ENUM_LABEL: Record<TinyintEnum, string> = {
  [TinyintEnum.OPTION1]: '选项1',
  [TinyintEnum.OPTION2]: '选项2',
  [TinyintEnum.OPTION3]: '选项3',
  [TinyintEnum.OPTION4]: '选项4',
  [TinyintEnum.OPTION5]: '选项5',
};

export enum DomainStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export const DOMAIN_STATUS_LABEL: Record<DomainStatus, string> = {
  [DomainStatus.ACTIVE]: '激活',
  [DomainStatus.INACTIVE]: '未激活',
  [DomainStatus.PENDING]: '待处理',
};

@Entity('domain')
export class DomainEntity extends BaseEntityWithId {
  // 字符串类型
  /**
   * 字符串类型选择指南：
   * 1. char：固定长度，适合存储固定长度的字符串，如手机号、身份证号等
   * 2. varchar：可变长度，适合存储长度不固定的字符串，如用户名、标题等
   * 3. text：适合存储大文本，如文章内容、评论等
   *
   * 性能考虑：
   * - char 类型在存储和查询时性能较好，但会占用固定空间
   * - varchar 类型在存储时更节省空间，但查询性能略低于 char
   * - text 类型不适合建立索引，查询性能较差
   */

  @Column({
    type: 'varchar', // sqlite does not support char, use varchar instead
    length: 6,
    comment: '适用于存储固定长度的字符串，如手机号、身份证号、国家代码、状态码等。长度固定，不足会补空格。存储空间：固定长度',
  })
  char: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '适用于存储可变长度的字符串，如用户名、标题、描述等。大长度建议不超过 255 字符。存储空间：实际长度 + 1-2字节',
  })
  varchar: string;

  @Column({
    type: 'text',
    comment: '适用于存储中等长度的文本，如文章内容、评论等。存储空间：最大 65,535 字节',
    nullable: true,
  })
  text: string;

  // 数值类型
  /**
   * 数值类型选择指南：
   * 1. tinyint：-128 到 127，1字节。适用于存储小范围整数，如年龄、状态码（
   * 2. smallint：-32768 到 32767，2字节
   * 3. mediumint：-8388608 到 8388607，3字节
   * 4. int：-2^31 到 2^31-1，4字节
   * 5. bigint：-2^63 到 2^63-1，8字节。适用于存储大整数，如长ID、时间戳等
   *
   * 性能考虑：
   * - 选择合适的数据类型可以节省存储空间
   * - 整数类型比浮点数类型性能更好
   * - 对于需要精确计算的场景，使用 decimal 类型
   */

  @Column({
    type: 'int',
    comment: '适用于存储普通整数，如用户ID、订单号等（-2^31 到 2^31-1）',
  })
  int: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '适用于存储精确的十进制数，如金额、价格等。precision表示总位数，scale表示小数位数',
  })
  decimal: number;

  /**
## float vs double
1. 精度范围：
- float：单精度浮点数，占用 4 字节（32位）
- double：双精度浮点数，占用 8 字节（64位）
2. 精度差异：
- float：有效数字约为 6-7 位
- double：有效数字约为 15-17 位
3. 数值范围：
- float：±3.4E-38 到 ±3.4E+38
- double：±1.7E-308 到 ±1.7E+308
### 使用场景建议
1. 使用 float 的场景：
- 对精度要求不高的场景
- 需要节省存储空间的场景
- 例如：
  - 温度数据（如：36.5℃）
  - 简单的百分比（如：85.5%）
  - 一般的测量数据（如：身高、体重）
2. 使用 double 的场景：
- 需要高精度的计算场景
- 金融计算（如：金额、利率）
- 科学计算
- 例如：
  - 货币金额计算
  - 精确的工程计算
  - 需要高精度的科学数据
## 最佳实践建议
1. 在大多数业务场景中，建议使用 double，因为：
- 提供更高的精度
- 避免精度损失带来的问题
- 现代计算机存储空间通常不是问题
2. 只有在以下情况才考虑使用 float：
- 对存储空间有严格限制
- 数据量非常大，且对精度要求不高
- 确定该字段不会用于需要高精度的计算
3. 注意事项：
- 避免使用浮点数进行精确的相等比较
- 在需要精确计算的场景（如金融计算），建议使用 decimal 类型
- 在 TypeORM 中，这两种类型都会映射为 JavaScript 的 number 类型
总的来说，除非有特殊的存储空间限制，建议优先使用 double 类型，因为它能提供更好的精度保证，避免因精度问题带来的潜在风险。
   */

  /**
## 布尔
### tinyint vs boolean
1. 数据库层面的实现：
  - tinyint(1) 在 MySQL 中实际上就是用来表示布尔值的标准方式
  - boolean 类型在 MySQL 中会被自动转换为 tinyint(1)
  - 两者在数据库层面是完全等价的，都占用 1 字节存储空间
2. 类型映射：
  - tinyint(1) 在 TypeScript 中需要显式映射为 boolean 类型
  - boolean 类型在 TypeScript 中直接对应，不需要额外映射
3.代码可读性：
  - boolean 类型更直观，直接表明这是一个布尔值
  - tinyint 需要额外的注释说明其用途
4. 数据库兼容性：
  - tinyint(1) 在 MySQL 中是最标准的布尔值表示方式
  - boolean 类型在某些数据库系统中可能不被支持
### 使用建议
1. 在大多数情况下，更推荐使用 boolean 类型，因为：
  - 代码更清晰，意图更明确
  - 不需要额外的注释说明
  - TypeScript 类型映射更自然
  - 在 TypeORM 中有更好的类型支持
2. 只有在以下情况才考虑使用 tinyint：
  - 需要与特定的数据库系统兼容
  - 需要存储除了 true/false 之外的其他值（比如 null）
  - 需要与旧系统保持兼容
   */

  @Column({
    type: 'tinyint',
    default: 0,
    nullable: true,
    comment: '使用 tinyint(1) 来表示布尔值（0 或 1）',
  })
  tinyintToAchieveBoolean: boolean;

  @Column({
    type: 'boolean',
    default: false,
    nullable: true,
  })
  boolean: boolean;

  /**
## 枚举
### tinyint vs enum
1. 数据库层面的实现：
  - tinyint 在数据库中存储为数字（1-5），占用空间小（1字节）
  - enum 在数据库中存储为字符串，占用空间相对较大
2. 类型安全性：
  - enum 类型在数据库层面就有类型约束，只能插入预定义的值
  - tinyint 需要应用层进行约束，数据库层面只保证是数字
3. 可维护性：
  - enum 类型更直观，直接使用枚举名称，代码可读性更好
  - tinyint 需要记住数字对应的含义，可维护性较差
4. 性能：
  - tinyint 在存储和查询性能上略优于 enum
  - enum 在比较和索引时可能会有轻微的性能开销
### 使用建议
1. 如果枚举值较少（比如状态、类型等），且需要良好的可读性和类型安全性，建议使用 enum 类型。
2. 如果枚举值较多，或者对存储空间和性能有严格要求，可以考虑使用 tinyint。
3. 在大多数业务场景中，我更推荐使用 enum 类型，因为：
  - 代码可读性更好
  - 类型安全性更高
  - 维护成本更低
  - 性能差异在实际应用中通常可以忽略
4. 只有在以下情况才考虑使用 tinyint：
  - 枚举值非常多
  - 对存储空间有严格限制
  - 需要频繁进行数值计算或比较
   */

  @Column({
    type: 'tinyint',
    default: TinyintEnum.OPTION1,
    nullable: true,
    comment: `使用 tinyint 实现枚举值（1-5）。${createEnumDescription(TINYINT_ENUM_LABEL)}`,
  })
  tinyintToAchieveEnum: TinyintEnum;

  @Column({
    type: 'varchar', // sqlite does not support enum , use varchar instead
    enum: DomainStatus,
    default: DomainStatus.PENDING,
    nullable: true,
    comment: '适用于存储枚举值，如状态、类型等预定义的选项',
  })
  enum: DomainStatus;

  // 日期和时间类型
  /**
   * 日期时间类型选择指南：
   * 1. date：仅存储日期，格式：YYYY-MM-DD [生日]
   * 2. time：仅存储时间，格式：HH:MM:SS [营业时间]
   * 3. datetime：存储日期和时间，格式：YYYY-MM-DD HH:MM:SS [创建时间]
   * 4. timestamp：存储时间戳，自动更新，与时区相关 [最后登录时间]
   *
   * 性能考虑：
   * - timestamp 比 datetime 占用空间更小
   * - timestamp 会自动更新，适合记录创建和更新时间
   * - datetime 不受时区影响，适合存储固定时间点
   */

  @Column({
    type: 'date',
    nullable: true,
    comment: '适用于存储日期，如生日、创建日期等，格式：YYYY-MM-DD。存储空间：3字节',
  })
  date: Date;

  @Column({
    type: 'time',
    nullable: true,
    comment: '适用于存储时间，如会议时间、营业时间等，格式：HH:MM:SS。存储空间：3字节',
  })
  time: string;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '适用于存储日期和时间，如创建时间、更新时间等，格式：YYYY-MM-DD HH:MM:SS。存储空间：8字节，不受时区影响',
  })
  datetime: Date;

  @Column({
    type: 'varchar', // sqlite does not support timestamp, use varchar instead
    length: 15, // 也可以使用 bigint 、 varchar ，考虑到存在精度丢失问题，使用 varchar
    comment: '适用于存储时间戳，自动更新，常用于记录数据的创建和更新时间。存储空间：4字节，受时区影响',
    nullable: true,
  })
  timestamp: Date;

  @Column({
    type: 'int', // sqlite does not support year, use int instead
    nullable: true,
  })
  year: number;

  // JSON
  /**
   * JSON 类型使用说明：
   * 1. 适用于存储结构化数据，如配置信息、动态属性等
   * 2. 支持 JSON 查询和索引
   * 3. 存储空间：实际 JSON 字符串长度
   *
   * 性能考虑：
   * - JSON 类型查询性能较差
   * - 建议对频繁查询的字段建立索引
   * - 避免存储过大的 JSON 数据
   */

  @Column({
    type: 'json',
    nullable: true,
    comment: '适用于存储JSON格式的数据，如配置信息、动态属性等。支持 JSON 查询和索引',
  })
  json: object;

  // 数组类型
  /**
   * TypeORM 的 simple-array 类型会将其序列化为数据库中的字符串（通常是逗号分隔）。
   * 优点： 实现简单，读取方便。
   * 缺点： 查询不方便，例如要查找所有选择了选项 3 的记录，需要进行字符串匹配，效率较低且容易出错。不适合大量选项或复杂查询。
   * 适用场景： 选项数量少且固定，主要用于存储和展示，不需要根据选项进行复杂的过滤和统计。
   *
   * 使用建议
   * 只有几个固定选项的简单多选场景，如果不需要复杂的查询（例如只需要展示选中的值），使用 simple-array 是最简单快捷的方式，并且在 TypeORM 中支持良好。
   * 如果需要根据选中的选项进行过滤、统计等查询操作，或者选项数量可能增加，强烈建议使用关联表 (多对多关系)
   * JSON 类型是介于 simple-array 和关联表之间的一个选项，如果您的数据库支持 JSON 函数并且查询需求不太复杂，也可以考虑
   */
  @Column({
    type: 'simple-array',
    nullable: true,
  })
  array: string[];

  // 二进制类型
  // Buffer: binary | varbinary | blob | tinyblob | mediumblob | longblob
  /**
   * 二进制类型选择指南：
   * 1. binary：固定长度的二进制数据
   * 2. varbinary：可变长度的二进制数据
   * 3. blob：大二进制对象
   *
   * 性能考虑：
   * - 二进制类型不适合建立索引
   * - 建议使用 varbinary 存储小文件
   * - 大文件建议使用文件系统存储
   */

  // @Column({
  //   type: 'varbinary',
  //   length: 255,
  //   comment: '适用于存储二进制数据，如文件内容、图片等。存储空间：实际长度 + 1-2字节',
  // })
  // varbinary: Buffer;

  @Column({
    type: 'blob',
    comment: '适用于存储大二进制数据，如文件内容等。存储空间：最大 65,535 字节',
    nullable: true,
  })
  blob: Buffer;

  // 空间数据类型
  // object: geometry | point | linestring | polygon | multipoint | multilinestring | multipolygon
}
