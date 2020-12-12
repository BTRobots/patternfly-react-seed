import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Battle } from '@app/Battle/Battle';

const stories = storiesOf('Components', module);
stories.addDecorator(withInfo);
stories.add(
  'Battle',
  () => <Battle />,
  { info: { inline: true } }
);
