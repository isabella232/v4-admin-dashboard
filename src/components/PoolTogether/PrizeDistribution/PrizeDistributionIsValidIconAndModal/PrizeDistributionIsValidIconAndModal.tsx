import { useEffect, useState } from 'react';

import { computePrizeDistribution } from '@pooltogether/v4-js';
import { Draw } from '@pooltogether/v4-js/dist/types';
import { AppInformationPopover } from '@src/components/App/AppInformationPopover';
import { ModalSetPrizeDistribution } from '@src/components/PoolTogether/PrizeDistribution/ModalSetPrizeDistribution';
import { convertPrizeDistributionTupleToFormDefaults } from '@src/lib/convertPrizeDistributionTupleToFormDefaults';
import { useEthers } from '@usedapp/core';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import { CheckCircle, AlertTriangle } from 'react-feather';

import { PrizeDistributionIsNotValidInformationPopover } from './PrizeDistributionIsNotValidInformationPopover';
import { PrizeDistributionIsValidInformationPopover } from './PrizeDistributionIsValidInformationPopover';
interface PrizeDistributionIsValidIconAndModalProps {
  className?: string;
  drawId: string;
  draw: Draw;
  prizeDistribution: any;
}

export const PrizeDistributionIsValidIconAndModal = ({
  className,
  drawId,
  draw,
  prizeDistribution,
}: PrizeDistributionIsValidIconAndModalProps) => {
  const { chainId } = useEthers();

  const [contracts, setContracts] = useState<any>();

  useEffect(() => {
    if (chainId === 1) {
      const prizeTierHistory = '0xdD1cba915Be9c7a1e60c4B99DADE1FC49F67f80D';
      const ticketL1 = '0xdd4d117723C257CEe402285D3aCF218E9A8236E1';
      const ticketL2 = '0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076';
      setContracts({
        prizeTierHistory,
        ticketL1,
        ticketL2,
      });
    }

    if (chainId === 137) {
      const prizeTierHistory = '0xdD1cba915Be9c7a1e60c4B99DADE1FC49F67f80D';
      const ticketL1 = '0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076';
      const ticketL2 = '0xdd4d117723C257CEe402285D3aCF218E9A8236E1';

      setContracts({
        prizeTierHistory,
        ticketL1,
        ticketL2,
      });
    }
  }, [chainId]);

  const [prizeDistributionCalculated, setPrizeDistributionCalculatedSet] = useState<any>();
  useEffect(() => {
    if (contracts) {
      (async () => {
        const pz = await computePrizeDistribution(
          draw,
          contracts.prizeTierHistory,
          contracts.ticketL1,
          [contracts.ticketL2]
        );

        console.log(pz, 'pzpz');
        setPrizeDistributionCalculatedSet(pz);
      })();
    }
  }, [contracts, draw, drawId]);

  const [isValidPrizeDistribution, setIsValidPrizeDistribution] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      if (prizeDistributionCalculated && !isValidPrizeDistribution) {
        const results = convertPrizeDistributionTupleToFormDefaults(prizeDistributionCalculated);
        const resultsWithDrawId = { ...results, drawId: Number(drawId) };
        const calculatedMatchesCurrentSettings = isEqual(resultsWithDrawId, prizeDistribution);
        setIsValidPrizeDistribution(calculatedMatchesCurrentSettings);
      }
    })();
  }, [drawId, isValidPrizeDistribution, prizeDistribution, prizeDistributionCalculated]);

  const styleBase = classNames(className, '');
  return (
    <div className={styleBase}>
      <span className="tag tag-white -ml-8 cursor-pointer shadow-sm top-0 hover-up hover:border-b-2">
        <div className="flex items-center">
          {!!isValidPrizeDistribution && (
            <>
              <div className="flex items-center mr-2">
                <CheckCircle className="text-green-500 mr-2" width={18} />
                <span className="">Valid PrizeDistribution</span>
              </div>
              <AppInformationPopover
                content={<PrizeDistributionIsValidInformationPopover isValid={true} />}
                size={12}
                positions={['right', 'top']}
              />
            </>
          )}
          {!isValidPrizeDistribution && (
            <>
              <ModalSetPrizeDistribution drawId={drawId} prizeDistribution={prizeDistribution}>
                <div className="flex items-center mr-2">
                  <AlertTriangle className="text-red-500 mr-2" width={18} />
                  <span className="">Requires Attention</span>
                </div>
              </ModalSetPrizeDistribution>
              <AppInformationPopover
                content={<PrizeDistributionIsNotValidInformationPopover />}
                size={12}
                positions={['right', 'top']}
              />
            </>
          )}
        </div>
      </span>
    </div>
  );
};

export default PrizeDistributionIsValidIconAndModal;
